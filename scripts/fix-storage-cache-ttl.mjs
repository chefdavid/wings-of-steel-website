#!/usr/bin/env node
/**
 * Raise the cache-control TTL on existing Supabase Storage objects.
 *
 * WHY
 * ---
 * Supabase defaults uploads to `cache-control: max-age=3600`. GTmetrix's
 * "Serve static assets with an efficient cache policy" audit (872 KB of
 * potential savings, 2026-08-23) is entirely storage objects sitting on that
 * 60-minute TTL — game photos, press images and player headshots that never
 * change once uploaded.
 *
 * New uploads were fixed at the source (ImageUpload.tsx, usePressStories.ts),
 * but the TTL is baked into each stored object's metadata, so existing files
 * need to be rewritten to pick up the new value. The Storage API has no
 * "update metadata only" call — `update()` replaces the object — so this
 * downloads each file and re-uploads the identical bytes with a 1-year TTL.
 *
 * The bytes are unchanged; only the cache-control metadata moves. Paths are
 * preserved exactly, so every existing image_url keeps working.
 *
 * VERIFYING IT WORKED
 * -------------------
 * Do not trust the public URL immediately after a run. Supabase fronts Storage
 * with Cloudflare, and the edge keeps serving the previously cached response —
 * old `cache-control` header included — long after the origin object changes.
 * A run on 2026-08-23 showed `max-age=3600` over HTTP with `CF-Cache-Status:
 * HIT` and `Age: 1393503` while the origin already held the new value. Adding a
 * query param does not help; the CDN ignores it.
 *
 * Check the stored metadata instead, which is authoritative:
 *
 *   supabase.storage.from('game-photos').list('players')
 *     -> entry.metadata.cacheControl, entry.updated_at
 *
 * The public URL catches up once the edge copy expires.
 *
 * SAFETY
 * ------
 * Dry-run by default. Pass --apply to rewrite. Skips anything already on a
 * long TTL, so it is safe to re-run. Note the skip check reads the *public URL*,
 * so a re-run soon after an apply will re-report objects it already fixed —
 * that is the CDN lying, not a failure.
 *
 *   node scripts/fix-storage-cache-ttl.mjs           # report only
 *   node scripts/fix-storage-cache-ttl.mjs --apply
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY.
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const APPLY = process.argv.includes('--apply');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BUCKET = 'game-photos';
const NEW_TTL = '31536000'; // 1 year
// Anything at or above this is already fine; used to make re-runs cheap.
const ALREADY_LONG = 86400;

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

/** Storage list() is not recursive — walk the folder tree ourselves. */
async function walk(supabase, prefix = '', depth = 0) {
  if (depth > 6) return [];
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(prefix, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

  if (error) {
    console.error(`  ! list failed for "${prefix || '/'}": ${error.message}`);
    return [];
  }

  const out = [];
  for (const entry of data || []) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    // Folders come back with a null id and no metadata.
    if (entry.id === null || !entry.metadata) {
      out.push(...(await walk(supabase, path, depth + 1)));
    } else {
      out.push({ path, size: entry.metadata.size ?? 0, mime: entry.metadata.mimetype });
    }
  }
  return out;
}

function currentMaxAge(cacheControl) {
  if (!cacheControl) return null;
  const m = /max-age=(\d+)/.exec(cacheControl);
  return m ? Number(m[1]) : null;
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(
    APPLY
      ? '=== APPLYING — objects will be rewritten with a 1-year TTL ==='
      : '=== DRY RUN — nothing will be written. Re-run with --apply to commit. ==='
  );
  console.log('');

  const files = await walk(supabase);
  console.log(`Found ${files.length} object(s) in "${BUCKET}".\n`);

  let needFix = 0;
  let alreadyOk = 0;
  let bytes = 0;
  let fixed = 0;
  let failed = 0;

  for (const f of files) {
    const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(f.path).data.publicUrl;

    // NB: a HEAD against a public storage URL answers `cache-control: no-cache`
    // regardless of what the object actually stores — it does not reflect the
    // object's metadata. A ranged GET returns the real header, so ask for a
    // single byte rather than downloading the file just to read its TTL.
    let ttl = null;
    try {
      const probe = await fetch(publicUrl, { headers: { Range: 'bytes=0-0' } });
      ttl = currentMaxAge(probe.headers.get('cache-control'));
      if (probe.body) await probe.arrayBuffer().catch(() => {});
    } catch {
      // fall through and treat as needing a fix
    }

    if (ttl !== null && ttl >= ALREADY_LONG) {
      alreadyOk++;
      continue;
    }

    needFix++;
    bytes += f.size;
    console.log(`  - ${f.path} (${kb(f.size)}, max-age=${ttl ?? 'unknown'})`);

    if (!APPLY) continue;

    try {
      const { data: blob, error: dlErr } = await supabase.storage.from(BUCKET).download(f.path);
      if (dlErr) throw dlErr;

      const buf = Buffer.from(await blob.arrayBuffer());

      const { error: upErr } = await supabase.storage.from(BUCKET).update(f.path, buf, {
        cacheControl: NEW_TTL,
        contentType: f.mime || blob.type || 'application/octet-stream',
        upsert: true,
      });
      if (upErr) throw upErr;

      console.log('    ✓ rewritten');
      fixed++;
    } catch (err) {
      console.log(`    ! failed: ${err.message}`);
      failed++;
    }
  }

  console.log('');
  console.log('─'.repeat(60));
  console.log(`objects already on a long TTL: ${alreadyOk}`);
  console.log(`objects ${APPLY ? 'rewritten' : 'needing a rewrite'}: ${APPLY ? fixed : needFix}`);
  if (failed) console.log(`failures: ${failed}`);
  console.log(`bytes affected: ${kb(bytes)}`);
  if (!APPLY) console.log('\nNothing was written. Re-run with --apply to commit.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
