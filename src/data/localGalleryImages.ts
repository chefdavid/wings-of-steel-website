// Gallery is driven by src/data/gallery-manifest.json, written by
// scripts/import-tournament-gallery.mjs after compression + upload to
// Supabase Storage. The manifest is the source of truth at runtime —
// the UI never scans the filesystem.

import manifest from './gallery-manifest.json'

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

const { tournaments } = manifest as Manifest

export const galleryTournaments: GalleryTournament[] = tournaments

export function getTournament(slug: string): GalleryTournament | undefined {
  return tournaments.find((t) => t.slug === slug)
}

export function getGame(tournamentSlug: string, gameSlug: string): GalleryGame | undefined {
  return getTournament(tournamentSlug)?.games.find((g) => g.slug === gameSlug)
}

export function getAllPhotos(): GalleryPhoto[] {
  return tournaments.flatMap((t) => t.games.flatMap((g) => g.photos))
}

export function getTotalPhotoCount(): number {
  return tournaments.reduce((n, t) => n + t.photoCount, 0)
}
