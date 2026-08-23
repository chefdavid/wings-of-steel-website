#!/usr/bin/env node
/**
 * Downscale the checked-in player/coach photos to the size the site actually
 * renders them at.
 *
 * WHY
 * ---
 * The files in public/images/players/ are camera-resolution masters — 2200x2200
 * and 1700x1700, 112–324 KB each, ~2.1 MB in total. The roster cards render
 * them at **205 CSS px**. Even allowing 2x for retina that is a 5x linear
 * oversize, roughly 29x more pixel data than any display needs.
 *
 * Measured on the live site 2026-08-23: `coach rico.webp` was the largest image
 * on the homepage at 134 KB, painted into a 282px box.
 *
 * WHAT IT DOES
 * ------------
 * Resizes every image in TARGET_DIRS to fit MAX_EDGE, re-encodes as WebP, and
 * writes it back to the same path — so nothing that references these files has
 * to change, including src/utils/updatePlayerImages.ts and the `image_url`
 * rows that point at /images/players/*.
 *
 * Files already at or under MAX_EDGE are skipped, so this is safe to re-run
 * after adding new photos.
 *
 * REVERSIBILITY
 * -------------
 * These are committed files, so the originals stay in git history. To recover a
 * master: `git show <commit>:public/images/players/<name>.webp > out.webp`
 *
 *   node scripts/optimize-local-images.mjs           # report only
 *   node scripts/optimize-local-images.mjs --apply
 */

import sharp from 'sharp';
import { readdirSync, statSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const APPLY = process.argv.includes('--apply');

// 205 CSS px is the largest slot these render into; 512 covers that at 2.5x.
const MAX_EDGE = 512;
const WEBP_QUALITY = 82;

const TARGET_DIRS = ['public/images/players'];
const EXTS = new Set(['.webp', '.jpg', '.jpeg', '.png']);

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

async function main() {
  console.log(
    APPLY
      ? '=== APPLYING — files will be rewritten in place ==='
      : '=== DRY RUN — nothing will be written. Re-run with --apply to commit. ==='
  );
  console.log('');

  let before = 0;
  let after = 0;
  let changed = 0;
  let skipped = 0;

  for (const dir of TARGET_DIRS) {
    const abs = join(ROOT, dir);
    let entries;
    try {
      entries = readdirSync(abs);
    } catch {
      console.log(`  (no such directory: ${dir})`);
      continue;
    }

    console.log(`${dir}:`);

    for (const name of entries) {
      const file = join(abs, name);
      if (!statSync(file).isFile() || !EXTS.has(extname(name).toLowerCase())) continue;

      const sizeBefore = statSync(file).size;
      // Read into a buffer rather than handing sharp the path. Sharp keeps a
      // lazy read handle on a path input, and on Windows writing back to that
      // same path then fails with EUNKNOWN (errno -4094).
      const input = readFileSync(file);
      const meta = await sharp(input).metadata();

      if (Math.max(meta.width, meta.height) <= MAX_EDGE) {
        skipped++;
        continue;
      }

      const out = await sharp(input)
        .rotate()
        .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();

      before += sizeBefore;
      after += out.length;
      changed++;

      console.log(
        `  - ${name}: ${meta.width}x${meta.height} ${kb(sizeBefore)} -> ` +
          `${MAX_EDGE}px ${kb(out.length)} (${Math.round((1 - out.length / sizeBefore) * 100)}% smaller)`
      );

      if (APPLY) writeFileSync(file, out);
    }
  }

  console.log('');
  console.log('─'.repeat(60));
  console.log(`files ${APPLY ? 'rewritten' : 'that would change'}: ${changed}`);
  console.log(`already small enough (skipped): ${skipped}`);
  console.log(`before: ${kb(before)}`);
  console.log(`after:  ${kb(after)}`);
  if (before) {
    console.log(`saved:  ${kb(before - after)} (${Math.round((1 - after / before) * 100)}%)`);
  }
  if (!APPLY) console.log('\nNothing was written. Re-run with --apply to commit.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
