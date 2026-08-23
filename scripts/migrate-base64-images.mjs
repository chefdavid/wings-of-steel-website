#!/usr/bin/env node
/**
 * Migrate legacy base64 `image_url` values out of Postgres and into Supabase
 * Storage.
 *
 * WHY
 * ---
 * A GTmetrix run on 2026-08-23 scored the homepage C / 66% with TBT 676ms and
 * a 4.72 MB page. The dominant cause was a single request:
 *
 *   /rest/v1/player_team_details?select=*   →  1.97 MB
 *   /rest/v1/coaches?select=*               →  355 KB
 *
 * 28 player/coach rows store their photo as a `data:image/...;base64,...` URI
 * directly in `image_url`. Those inflate the JSON, cannot be cached separately,
 * cannot be lazy-loaded, cannot be resized, and are re-sent on every page load.
 * In the DOM they accounted for ~6.1 MB of string data (one player alone was
 * 561 KB), which is what produced the 512ms main-thread task and the 3.5s gap
 * between First Contentful Paint (634ms) and Fully Loaded (4.5s).
 *
 * The admin uploader (src/components/admin/ImageUpload.tsx) already writes to
 * Storage correctly — these rows are leftovers from an older version of it.
 * This script backfills them.
 *
 * WHAT IT DOES
 * ------------
 * For each row whose image_url starts with `data:`:
 *   1. decode the base64 payload
 *   2. resize to fit 640px (the cards render at ~320px CSS px, so this still
 *      covers 2x DPR) and re-encode as WebP
 *   3. upload to the `game-photos` bucket with a 1-year cache-control
 *   4. rewrite image_url to the public Storage URL
 *
 * SAFETY
 * ------
 * Dry-run by default: it reports what it *would* do and writes nothing.
 * Pass --apply to perform the migration. Pass --backup to additionally dump
 * the original id/image_url pairs to a JSON file first, so the change can be
 * reversed.
 *
 *   node scripts/migrate-base64-images.mjs            # report only
 *   node scripts/migrate-base64-images.mjs --backup   # report + write backup
 *   node scripts/migrate-base64-images.mjs --apply --backup
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY (writes bypass RLS).
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const APPLY = process.argv.includes('--apply');
const BACKUP = process.argv.includes('--backup');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BUCKET = 'game-photos';
const MAX_EDGE = 640;
const WEBP_QUALITY = 82;

// Tables that carry a base64-capable image_url column.
const TARGETS = [
  { table: 'players', prefix: 'players' },
  { table: 'coaches', prefix: 'coaches' },
];

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

function decodeDataUri(uri) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/s.exec(uri);
  if (!match) return null;
  return { mime: match[1], buffer: Buffer.from(match[2], 'base64') };
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error(
      'Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n' +
        'Add them to .env / .env.local before running this script.'
    );
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(
    APPLY
      ? '=== APPLYING migration (rows will be rewritten) ==='
      : '=== DRY RUN — nothing will be written. Re-run with --apply to commit. ==='
  );
  console.log('');

  const backup = [];
  let totalBefore = 0;
  let totalAfter = 0;
  let migrated = 0;
  let failed = 0;

  for (const { table, prefix } of TARGETS) {
    const { data, error } = await supabase
      .from(table)
      .select('id, first_name, last_name, image_url');

    if (error) {
      console.error(`  ! could not read ${table}: ${error.message}`);
      failed++;
      continue;
    }

    const rows = (data || []).filter(
      (r) => typeof r.image_url === 'string' && r.image_url.startsWith('data:')
    );

    console.log(`${table}: ${rows.length} base64 row(s) of ${data?.length ?? 0} total`);

    for (const row of rows) {
      const name = `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim() || row.id;
      const decoded = decodeDataUri(row.image_url);

      if (!decoded) {
        console.log(`  ! ${name}: image_url is a data: URI but not base64 image — skipped`);
        failed++;
        continue;
      }

      const beforeBytes = row.image_url.length;
      totalBefore += beforeBytes;

      let out;
      try {
        out = await sharp(decoded.buffer)
          .rotate() // honour EXIF orientation before stripping it
          .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY })
          .toBuffer();
      } catch (err) {
        console.log(`  ! ${name}: could not decode image (${err.message}) — skipped`);
        failed++;
        continue;
      }

      totalAfter += out.length;
      backup.push({ table, id: row.id, name, image_url: row.image_url });

      console.log(
        `  - ${name}: ${kb(beforeBytes)} base64 → ${kb(out.length)} webp ` +
          `(${Math.round((1 - out.length / beforeBytes) * 100)}% smaller)`
      );

      if (!APPLY) {
        migrated++;
        continue;
      }

      const path = `${prefix}/migrated-${row.id}.webp`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, out, {
          contentType: 'image/webp',
          cacheControl: '31536000',
          upsert: true,
        });

      if (upErr) {
        console.log(`    ! upload failed: ${upErr.message}`);
        failed++;
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(path);

      const { error: updErr } = await supabase
        .from(table)
        .update({ image_url: publicUrl })
        .eq('id', row.id);

      if (updErr) {
        console.log(`    ! row update failed: ${updErr.message}`);
        failed++;
        continue;
      }

      console.log(`    ✓ ${publicUrl}`);
      migrated++;
    }
    console.log('');
  }

  if (BACKUP && backup.length) {
    const file = join(__dirname, '..', `base64-image-backup-${Date.now()}.json`);
    writeFileSync(file, JSON.stringify(backup, null, 2));
    console.log(`Backup of ${backup.length} original value(s) written to:\n  ${file}\n`);
  }

  console.log('─'.repeat(60));
  console.log(`rows ${APPLY ? 'migrated' : 'that would migrate'}: ${migrated}`);
  console.log(`failures/skips:  ${failed}`);
  console.log(`payload before:  ${kb(totalBefore)}`);
  console.log(`payload after:   ${kb(totalAfter)}`);
  if (totalBefore > 0) {
    console.log(
      `reduction:       ${kb(totalBefore - totalAfter)} ` +
        `(${Math.round((1 - totalAfter / totalBefore) * 100)}% of the roster JSON)`
    );
  }
  if (!APPLY) {
    console.log('\nNothing was written. Re-run with --apply --backup to commit.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
