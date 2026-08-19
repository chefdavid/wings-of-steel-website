#!/usr/bin/env node
// Generates gallery thumbnails + manifest from public/images/gallery/G*/*.jpg.
// Incremental: skips files whose thumbnail is newer than the source.
//
//   inputs : public/images/gallery/G<num>/<num>-<idx>.jpg
//   outputs: public/images/gallery/.thumbnails/G<num>/<num>-<idx>.jpg  (~400w, q75)
//            src/data/gallery-manifest.json

import { readdir, stat, mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const GALLERY_DIR = join(ROOT, 'public', 'images', 'gallery')
const THUMBS_DIR = join(GALLERY_DIR, '.thumbnails')
const MANIFEST_PATH = join(ROOT, 'src', 'data', 'gallery-manifest.json')
const THUMB_WIDTH = 400
const THUMB_QUALITY = 75

const FOLDER_LABELS = {
  G2: 'Game 2',
  G14: 'Game 14',
  G27: 'Game 27',
  G68: 'Game 68',
}

async function listGalleryFolders() {
  const entries = await readdir(GALLERY_DIR, { withFileTypes: true })
  return entries
    .filter((e) => e.isDirectory() && /^G\d+$/.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))
}

async function listJpegs(folder) {
  const dir = join(GALLERY_DIR, folder)
  const entries = await readdir(dir)
  return entries
    .filter((f) => /\.jpe?g$/i.test(f))
    .sort()
}

async function isUpToDate(srcPath, thumbPath) {
  if (!existsSync(thumbPath)) return false
  const [srcStat, thumbStat] = await Promise.all([stat(srcPath), stat(thumbPath)])
  return thumbStat.mtimeMs >= srcStat.mtimeMs
}

async function processImage(folder, file) {
  const srcPath = join(GALLERY_DIR, folder, file)
  const thumbDir = join(THUMBS_DIR, folder)
  const thumbPath = join(thumbDir, file)

  await mkdir(thumbDir, { recursive: true })

  let width
  let height

  if (await isUpToDate(srcPath, thumbPath)) {
    const meta = await sharp(srcPath).metadata()
    width = meta.width
    height = meta.height
  } else {
    const pipeline = sharp(srcPath).rotate()
    const meta = await pipeline.metadata()
    width = meta.width
    height = meta.height
    await pipeline
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: THUMB_QUALITY, mozjpeg: true })
      .toFile(thumbPath)
  }

  const id = file.replace(/\.jpe?g$/i, '')
  return {
    id,
    folder,
    src: '/' + relative(join(ROOT, 'public'), srcPath).split('\\').join('/'),
    thumbnail: '/' + relative(join(ROOT, 'public'), thumbPath).split('\\').join('/'),
    width: width ?? 1600,
    height: height ?? 1200,
    alt: `${FOLDER_LABELS[folder] ?? folder} - ${id}`,
  }
}

async function main() {
  if (!existsSync(GALLERY_DIR)) {
    console.warn(`[gallery] ${GALLERY_DIR} not found, writing empty manifest`)
    await mkdir(dirname(MANIFEST_PATH), { recursive: true })
    await writeFile(MANIFEST_PATH, JSON.stringify({ folders: [], images: [] }, null, 2))
    return
  }

  const folders = await listGalleryFolders()
  const images = []
  let regenerated = 0
  let skipped = 0

  for (const folder of folders) {
    const files = await listJpegs(folder)
    process.stdout.write(`[gallery] ${folder}: ${files.length} files...`)
    const start = Date.now()
    for (const file of files) {
      const srcPath = join(GALLERY_DIR, folder, file)
      const thumbPath = join(THUMBS_DIR, folder, file)
      const cached = await isUpToDate(srcPath, thumbPath)
      const entry = await processImage(folder, file)
      images.push(entry)
      if (cached) skipped++
      else regenerated++
    }
    process.stdout.write(` done in ${((Date.now() - start) / 1000).toFixed(1)}s\n`)
  }

  const folderManifest = folders.map((f) => ({
    name: FOLDER_LABELS[f] ?? f,
    path: f,
    imageCount: images.filter((i) => i.folder === f).length,
  }))

  await mkdir(dirname(MANIFEST_PATH), { recursive: true })
  await writeFile(
    MANIFEST_PATH,
    JSON.stringify({ folders: folderManifest, images }, null, 2),
  )

  console.log(
    `[gallery] manifest written: ${images.length} images (${regenerated} regenerated, ${skipped} cached)`,
  )
}

main().catch((err) => {
  console.error('[gallery] failed:', err)
  process.exit(1)
})
