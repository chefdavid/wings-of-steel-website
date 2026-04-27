// Gallery is driven by a build-time manifest (scripts/generate-thumbnail-manifest.mjs).
// The manifest lists every image with its thumbnail path and real dimensions, so the UI
// no longer needs to preload full-size images at runtime to discover them.

import manifest from './gallery-manifest.json'

export interface GalleryImage {
  id: string
  src: string
  thumbnail: string
  alt: string
  width: number
  height: number
  folder: string
}

export interface GalleryFolder {
  name: string
  path: string
  imageCount: number
}

interface Manifest {
  folders: GalleryFolder[]
  images: GalleryImage[]
}

const { folders, images } = manifest as Manifest

const allFolder: GalleryFolder = {
  name: 'All Images',
  path: '*',
  imageCount: images.length,
}

export const galleryFolders: GalleryFolder[] = [allFolder, ...folders]

export const getLocalImages = (folder: string, page: number = 1, limit: number = 20) => {
  const filtered =
    folder === '' || folder === '*'
      ? images
      : images.filter((img) => img.folder === folder)

  const start = (page - 1) * limit
  const end = start + limit

  return {
    images: filtered.slice(start, end),
    total: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
    page,
    limit,
  }
}
