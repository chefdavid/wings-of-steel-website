// Gallery is driven by src/data/gallery-manifest.json, written by
// scripts/import-tournament-gallery.mjs after compression + upload to
// Supabase Storage. The manifest is the source of truth at runtime —
// the UI never scans the filesystem.
//
// The `?url` import makes Vite emit the JSON as a hashed static asset
// instead of bundling it into the JS chunk. We then fetch it on demand
// so the gallery route loads quickly and the JSON parses natively.
import manifestUrl from './gallery-manifest.json?url'

export interface GalleryPhoto {
  id: string
  src: string
  thumbnail: string
  alt: string
  width: number
  height: number
}

export interface GalleryGame {
  slug: string
  label: string
  coverPhoto: string | null
  photos: GalleryPhoto[]
}

export interface GalleryTournament {
  slug: string
  label: string
  date: string | null
  description: string | null
  coverPhoto: string | null
  photoCount: number
  games: GalleryGame[]
}

interface Manifest {
  tournaments: GalleryTournament[]
}

let cache: Manifest | null = null
let inflight: Promise<Manifest> | null = null

export async function loadGallery(): Promise<Manifest> {
  if (cache) return cache
  if (!inflight) {
    inflight = fetch(manifestUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Gallery manifest fetch failed: ${res.status}`)
        return res.json()
      })
      .then((data: Manifest) => {
        cache = data
        return data
      })
      .catch((err) => {
        inflight = null
        throw err
      })
  }
  return inflight
}

export function getTournamentFrom(
  manifest: Manifest,
  slug: string
): GalleryTournament | undefined {
  return manifest.tournaments.find((t) => t.slug === slug)
}

export function getGameFrom(
  manifest: Manifest,
  tournamentSlug: string,
  gameSlug: string
): GalleryGame | undefined {
  return getTournamentFrom(manifest, tournamentSlug)?.games.find(
    (g) => g.slug === gameSlug
  )
}

export function getTotalPhotoCountFrom(manifest: Manifest): number {
  return manifest.tournaments.reduce((n, t) => n + t.photoCount, 0)
}
