#!/usr/bin/env node
// Compress and upload a tournament's photos to Supabase Storage.
// Updates src/data/gallery-manifest.json with the new tournament entry.
//
// Usage:
//   node scripts/import-tournament-gallery.mjs \
//     --source "C:/path/to/folder-of-zips-or-folders" \
//     --tournament 2026-nationals-dallas \
//     --label "2026 USA Hockey Sled Nationals — Dallas" \
//     --date 2026-04-30 \
//     [--description "..."] \
//     [--game-map game-map.json]
//
// What it does:
//   - Walks --source. Each .zip becomes a game (extracted to a temp dir).
//     Each subdirectory becomes a game. JPGs directly in --source become
//     a single game using --source's basename.
//   - For each photo: compresses to 2400px JPEG q82 (large) and 400px q75
//     (thumb), strips EXIF, auto-rotates.
//   - Uploads both to the 'gallery' bucket:
//       <tournament>/<game>/<file>.jpg                 (large)
//       _thumbs/<tournament>/<game>/<file>.jpg         (thumb)
//   - Replaces the tournament entry in src/data/gallery-manifest.json.
//
// Re-running with the same args is safe: uploads use upsert.

import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import AdmZip from 'adm-zip'
import { readdir, stat, mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, basename, extname, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { config as dotenvConfig } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

dotenvConfig({ path: join(ROOT, '.env') })

const MANIFEST_PATH = join(ROOT, 'src', 'data', 'gallery-manifest.json')
const BUCKET = 'gallery'
const LARGE_MAX = 2400
const LARGE_QUALITY = 82
const THUMB_MAX = 400
const THUMB_QUALITY = 75
const UPLOAD_CONCURRENCY = 4
const SUPPORTED_INPUT = /\.(jpe?g|webp|png)$/i

function parseArgs(argv) {
  const args = {}
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const key = a.slice(2)
      const next = argv[i + 1]
      if (!next || next.startsWith('--')) {
        args[key] = true
      } else {
        args[key] = next
        i++
      }
    }
  }
  return args
}

const args = parseArgs(process.argv)

function fail(msg) {
  console.error(`error: ${msg}`)
  process.exit(1)
}

if (!args.source) fail('missing --source')
if (!args.tournament) fail('missing --tournament')
if (!args.label) fail('missing --label')

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
if (!SUPABASE_URL || !SUPABASE_KEY) fail('missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env')

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
})

function slugify(input) {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/\.zip$/i, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`
}

async function loadManifest() {
  if (!existsSync(MANIFEST_PATH)) {
    return { tournaments: [] }
  }
  const raw = await readFile(MANIFEST_PATH, 'utf8')
  const parsed = JSON.parse(raw)
  if (Array.isArray(parsed.tournaments)) return parsed
  // Migrate the old flat shape if we encounter it. The old shape had
  // {folders, images} at the top — anything in there isn't compatible
  // with the new tournament-grouped format, so we start fresh.
  return { tournaments: [] }
}

async function saveManifest(manifest) {
  await mkdir(dirname(MANIFEST_PATH), { recursive: true })
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n')
}

async function listJpegsInDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const out = []
  for (const e of entries) {
    if (e.isFile() && SUPPORTED_INPUT.test(e.name)) {
      out.push(join(dir, e.name))
    }
  }
  return out.sort()
}

async function discoverGames(sourcePath) {
  // Returns [{ label, slug, getFiles: async () => string[], cleanup?: async () => void }]
  const stats = await stat(sourcePath)
  if (!stats.isDirectory()) {
    fail(`--source is not a directory: ${sourcePath}`)
  }

  const entries = await readdir(sourcePath, { withFileTypes: true })
  const games = []

  // Direct JPGs in source → single game
  const directJpegs = entries.filter((e) => e.isFile() && SUPPORTED_INPUT.test(e.name))
  if (directJpegs.length > 0) {
    const label = basename(sourcePath)
    games.push({
      label,
      slug: slugify(label) || 'photos',
      getFiles: async () =>
        directJpegs.map((e) => join(sourcePath, e.name)).sort(),
    })
    return games
  }

  // Subdirectories → one game each
  const subdirs = entries.filter((e) => e.isDirectory())
  for (const dir of subdirs) {
    const dirPath = join(sourcePath, dir.name)
    games.push({
      label: dir.name,
      slug: slugify(dir.name),
      getFiles: () => listJpegsInDir(dirPath),
    })
  }

  // Zips → extract to tempdir, treat extracted contents as a game
  const zips = entries.filter((e) => e.isFile() && /\.zip$/i.test(e.name))
  for (const zipEntry of zips) {
    const zipPath = join(sourcePath, zipEntry.name)
    const baseLabel = basename(zipEntry.name, extname(zipEntry.name))
    games.push({
      label: baseLabel,
      slug: slugify(baseLabel),
      getFiles: async () => {
        const extractDir = await mkdir(
          join(tmpdir(), `wos-import-${slugify(baseLabel)}-${Date.now()}`),
          { recursive: true }
        )
        const target = extractDir
        process.stdout.write(`  extracting ${zipEntry.name}…\n`)
        const zip = new AdmZip(zipPath)
        zip.extractAllTo(target, true)
        // Walk extracted dir for JPGs (some zips have a wrapping folder)
        const files = []
        async function walk(d) {
          const items = await readdir(d, { withFileTypes: true })
          for (const it of items) {
            const p = join(d, it.name)
            if (it.isDirectory()) await walk(p)
            else if (SUPPORTED_INPUT.test(it.name)) files.push(p)
          }
        }
        await walk(target)
        return files.sort()
      },
      cleanup: async (extractRoot) => {
        if (extractRoot) await rm(extractRoot, { recursive: true, force: true })
      },
    })
  }

  if (games.length === 0) fail(`no zips, subfolders, or JPGs found in ${sourcePath}`)

  return games
}

async function compressAndUpload(filePath, tournamentSlug, gameSlug) {
  const fileBaseName = basename(filePath, extname(filePath)).replace(/[^a-zA-Z0-9-_]/g, '_')
  const ext = extname(filePath).toLowerCase()
  const isWebP = ext === '.webp'
  const outExt = isWebP ? 'webp' : 'jpg'
  const outName = `${fileBaseName}.${outExt}`
  const outContentType = isWebP ? 'image/webp' : 'image/jpeg'

  const meta = await sharp(filePath).metadata()

  // Preserve input format on output. WebP source → WebP large + WebP thumb.
  // Anything else → JPEG. The user has already compressed inputs, so for
  // large we just resize (no re-compression beyond that).
  const largeBuffer = isWebP
    ? await sharp(filePath)
        .rotate()
        .withMetadata({ exif: {} })
        .resize({ width: LARGE_MAX, height: LARGE_MAX, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: LARGE_QUALITY })
        .toBuffer()
    : await sharp(filePath)
        .rotate()
        .withMetadata({ exif: {} })
        .resize({ width: LARGE_MAX, height: LARGE_MAX, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: LARGE_QUALITY, mozjpeg: true })
        .toBuffer()

  const thumbBuffer = isWebP
    ? await sharp(filePath)
        .rotate()
        .withMetadata({ exif: {} })
        .resize({ width: THUMB_MAX, height: THUMB_MAX, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: THUMB_QUALITY })
        .toBuffer()
    : await sharp(filePath)
        .rotate()
        .withMetadata({ exif: {} })
        .resize({ width: THUMB_MAX, height: THUMB_MAX, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: THUMB_QUALITY, mozjpeg: true })
        .toBuffer()

  const largeMeta = await sharp(largeBuffer).metadata()

  const largePath = `${tournamentSlug}/${gameSlug}/${outName}`
  const thumbPath = `_thumbs/${tournamentSlug}/${gameSlug}/${outName}`

  const [largeRes, thumbRes] = await Promise.all([
    supabase.storage.from(BUCKET).upload(largePath, largeBuffer, {
      contentType: outContentType,
      upsert: true,
    }),
    supabase.storage.from(BUCKET).upload(thumbPath, thumbBuffer, {
      contentType: outContentType,
      upsert: true,
    }),
  ])

  if (largeRes.error) throw new Error(`upload large failed: ${largeRes.error.message}`)
  if (thumbRes.error) throw new Error(`upload thumb failed: ${thumbRes.error.message}`)

  const { data: largeUrl } = supabase.storage.from(BUCKET).getPublicUrl(largePath)
  const { data: thumbUrl } = supabase.storage.from(BUCKET).getPublicUrl(thumbPath)

  return {
    id: fileBaseName,
    src: largeUrl.publicUrl,
    thumbnail: thumbUrl.publicUrl,
    width: largeMeta.width || meta.width || LARGE_MAX,
    height: largeMeta.height || meta.height || LARGE_MAX,
    sourceBytes: (await stat(filePath)).size,
    largeBytes: largeBuffer.length,
    thumbBytes: thumbBuffer.length,
  }
}

async function processGame(game, tournamentSlug, tournamentLabel) {
  const files = await game.getFiles()
  if (files.length === 0) {
    console.log(`  ${game.label}: no jpgs found, skipping`)
    return null
  }
  console.log(`  ${game.label} → ${game.slug} (${files.length} photos)`)

  const photos = []
  let totalSource = 0
  let totalCompressed = 0
  let processed = 0

  // Process in parallel batches
  for (let i = 0; i < files.length; i += UPLOAD_CONCURRENCY) {
    const batch = files.slice(i, i + UPLOAD_CONCURRENCY)
    const results = await Promise.allSettled(
      batch.map((f) => compressAndUpload(f, tournamentSlug, game.slug))
    )
    for (let j = 0; j < results.length; j++) {
      const r = results[j]
      if (r.status === 'fulfilled') {
        const p = r.value
        photos.push({
          id: p.id,
          src: p.src,
          thumbnail: p.thumbnail,
          width: p.width,
          height: p.height,
          alt: `${tournamentLabel} — ${game.label} — ${p.id}`,
        })
        totalSource += p.sourceBytes
        totalCompressed += p.largeBytes + p.thumbBytes
      } else {
        console.warn(`  ! ${basename(batch[j])}: ${r.reason?.message || r.reason}`)
      }
    }
    processed += batch.length
    process.stdout.write(`    ${processed}/${files.length} done\r`)
  }
  process.stdout.write('\n')
  console.log(
    `    in: ${formatBytes(totalSource)} → out: ${formatBytes(totalCompressed)} ` +
      `(${((totalCompressed / totalSource) * 100).toFixed(0)}%)`
  )

  return {
    slug: game.slug,
    label: game.label,
    coverPhoto: photos[0]?.thumbnail || null,
    photos,
  }
}

async function main() {
  const sourcePath = resolve(args.source)
  const tournamentSlug = slugify(args.tournament)
  const tournamentLabel = args.label
  const tournamentDate = args.date || null
  const description = args.description || null

  console.log(`Importing ${tournamentLabel} from ${sourcePath}`)
  console.log(`  → bucket: ${BUCKET}, slug: ${tournamentSlug}\n`)

  const games = await discoverGames(sourcePath)
  console.log(`Discovered ${games.length} game(s):`)
  for (const g of games) console.log(`  - ${g.label} → ${g.slug}`)
  console.log()

  const gameEntries = []
  const tStart = Date.now()
  for (const game of games) {
    const result = await processGame(game, tournamentSlug, tournamentLabel)
    if (result) gameEntries.push(result)
  }
  const elapsed = ((Date.now() - tStart) / 1000).toFixed(1)
  console.log(`\nDone in ${elapsed}s. Updating manifest…`)

  const manifest = await loadManifest()
  const tournamentEntry = {
    slug: tournamentSlug,
    label: tournamentLabel,
    date: tournamentDate,
    description,
    coverPhoto: gameEntries[0]?.coverPhoto || null,
    photoCount: gameEntries.reduce((n, g) => n + g.photos.length, 0),
    games: gameEntries,
  }

  const idx = manifest.tournaments.findIndex((t) => t.slug === tournamentSlug)
  if (idx >= 0) {
    manifest.tournaments[idx] = tournamentEntry
    console.log(`  replaced existing tournament: ${tournamentSlug}`)
  } else {
    manifest.tournaments.push(tournamentEntry)
    console.log(`  added new tournament: ${tournamentSlug}`)
  }

  // Sort tournaments by date descending (newest first), undated last
  manifest.tournaments.sort((a, b) => {
    if (!a.date && !b.date) return a.label.localeCompare(b.label)
    if (!a.date) return 1
    if (!b.date) return -1
    return b.date.localeCompare(a.date)
  })

  await saveManifest(manifest)
  console.log(`Manifest written: ${MANIFEST_PATH}`)
  console.log(
    `\n${tournamentEntry.photoCount} photos uploaded across ${gameEntries.length} game(s).`
  )
}

main().catch((err) => {
  console.error('Import failed:', err)
  process.exit(1)
})
