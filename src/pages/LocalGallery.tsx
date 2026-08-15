import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Gallery as PhotoSwipeGallery } from 'react-photoswipe-gallery'
import { motion, AnimatePresence } from 'framer-motion'
import ImageWithDimensions from '../components/ImageWithDimensions'
import {
  loadGallery,
  getTournamentFrom,
  getGameFrom,
  getTotalPhotoCountFrom,
  type GalleryTournament,
  type GalleryGame,
} from '../data/localGalleryImages'
import 'photoswipe/dist/photoswipe.css'

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200]

const LocalGallery = () => {
  const [tournamentSlug, setTournamentSlug] = useState<string | null>(null)
  const [gameSlug, setGameSlug] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [imagesPerPage, setImagesPerPage] = useState(50)
  const [galleryTournaments, setGalleryTournaments] = useState<GalleryTournament[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    loadGallery()
      .then((data) => {
        if (cancelled) return
        setGalleryTournaments(data.tournaments)
        setIsLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setLoadError(err instanceof Error ? err.message : 'Failed to load gallery')
        setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const manifest = useMemo(() => ({ tournaments: galleryTournaments }), [galleryTournaments])

  const tournament: GalleryTournament | undefined = tournamentSlug
    ? getTournamentFrom(manifest, tournamentSlug)
    : undefined
  const game: GalleryGame | undefined =
    tournamentSlug && gameSlug ? getGameFrom(manifest, tournamentSlug, gameSlug) : undefined

  const totalPhotos = useMemo(() => getTotalPhotoCountFrom(manifest), [manifest])

  const view: 'tournaments' | 'games' | 'photos' = game
    ? 'photos'
    : tournament
    ? 'games'
    : 'tournaments'

  const paginatedPhotos = useMemo(() => {
    if (!game) return { images: [], total: 0, totalPages: 0, page: 1 }
    const start = (currentPage - 1) * imagesPerPage
    const end = start + imagesPerPage
    return {
      images: game.photos.slice(start, end),
      total: game.photos.length,
      totalPages: Math.max(1, Math.ceil(game.photos.length / imagesPerPage)),
      page: currentPage,
    }
  }, [game, currentPage, imagesPerPage])

  const openTournament = (slug: string) => {
    setTournamentSlug(slug)
    setGameSlug(null)
    setCurrentPage(1)
  }

  const openGame = (slug: string) => {
    setGameSlug(slug)
    setCurrentPage(1)
  }

  const backToGames = () => {
    setGameSlug(null)
    setCurrentPage(1)
  }

  const backToTournaments = () => {
    setTournamentSlug(null)
    setGameSlug(null)
    setCurrentPage(1)
  }

  const headerLabel =
    view === 'photos' && tournament && game
      ? `${tournament.label} — ${game.label}`
      : view === 'games' && tournament
      ? tournament.label
      : 'Browse Tournaments'

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-steel to-black">
      <div className="bg-gradient-to-r from-steel-blue to-ice-blue py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-sport tracking-wider text-center">
            PHOTO GALLERY
          </h1>
        </div>
      </div>

      <header className="bg-black/50 backdrop-blur-sm sticky top-nav z-30 border-b border-steel-blue/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-white hover:text-ice-blue transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
            <h2 className="text-base sm:text-lg md:text-xl font-oswald text-white tracking-wider text-center flex-1 truncate">
              {headerLabel}
            </h2>
            <div className="text-steel-gray text-xs sm:text-sm whitespace-nowrap">
              {totalPhotos.toLocaleString()} photos
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        {view !== 'tournaments' && (
          <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
            <button
              onClick={backToTournaments}
              className="text-steel-gray hover:text-ice-blue transition-colors"
            >
              All Tournaments
            </button>
            {tournament && (
              <>
                <span className="text-steel-gray">/</span>
                {view === 'photos' ? (
                  <button
                    onClick={backToGames}
                    className="text-steel-gray hover:text-ice-blue transition-colors"
                  >
                    {tournament.label}
                  </button>
                ) : (
                  <span className="text-white">{tournament.label}</span>
                )}
              </>
            )}
            {game && (
              <>
                <span className="text-steel-gray">/</span>
                <span className="text-white">{game.label}</span>
              </>
            )}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="inline-block w-10 h-10 border-4 border-steel-gray/30 border-t-ice-blue rounded-full animate-spin mb-4" />
            <p className="text-steel-gray">Loading gallery…</p>
          </div>
        )}

        {/* Error state */}
        {!isLoading && loadError && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-oswald text-white mb-2">Gallery unavailable</h3>
            <p className="text-steel-gray">{loadError}</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !loadError && view === 'tournaments' && galleryTournaments.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-oswald text-white mb-2">No tournaments yet</h3>
            <p className="text-steel-gray">
              Run <code className="text-ice-blue">npm run gallery:import</code> to add a tournament.
            </p>
          </div>
        )}

        {/* Tournaments view */}
        {view === 'tournaments' && galleryTournaments.length > 0 && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {galleryTournaments.map((t, i) => (
              <motion.button
                key={t.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => openTournament(t.slug)}
                className="group text-left"
              >
                <div className="rounded-xl overflow-hidden bg-steel-gray/10 border border-steel-gray/20 hover:border-ice-blue/50 transition-all">
                  <div className="relative aspect-[3/2] bg-dark-steel overflow-hidden">
                    {t.coverPhoto ? (
                      <img
                        src={t.coverPhoto}
                        alt={t.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-steel-blue to-dark-steel" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-oswald text-xl leading-tight">{t.label}</h3>
                      <p className="text-ice-blue text-sm mt-1">
                        {t.games.length} game{t.games.length === 1 ? '' : 's'} · {t.photoCount} photos
                        {t.date && ` · ${new Date(t.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                      </p>
                    </div>
                  </div>
                  {t.description && (
                    <div className="p-4 text-steel-gray text-sm">{t.description}</div>
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Games view */}
        {view === 'games' && tournament && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {tournament.games.map((g, i) => (
              <motion.button
                key={g.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => openGame(g.slug)}
                className="group text-left"
              >
                <div className="rounded-xl overflow-hidden bg-steel-gray/10 border border-steel-gray/20 hover:border-ice-blue/50 transition-all">
                  <div className="relative aspect-[3/2] bg-dark-steel overflow-hidden">
                    {g.coverPhoto ? (
                      <img
                        src={g.coverPhoto}
                        alt={g.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-steel-blue to-dark-steel" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-oswald text-lg leading-tight">{g.label}</h3>
                    <p className="text-steel-gray text-sm mt-1">{g.photos.length} photos</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Photos view */}
        {view === 'photos' && game && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex items-center gap-4">
                <label className="text-steel-gray">Photos per page:</label>
                <select
                  value={imagesPerPage}
                  onChange={(e) => {
                    setImagesPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="bg-steel-gray/20 text-white px-3 py-1 rounded border border-steel-gray/30 focus:border-steel-blue outline-none"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              {paginatedPhotos.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-steel-gray/20 text-white rounded disabled:opacity-50 hover:bg-steel-gray/30 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-steel-gray px-3">
                    Page {currentPage} of {paginatedPhotos.totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(paginatedPhotos.totalPages, p + 1))
                    }
                    disabled={currentPage === paginatedPhotos.totalPages}
                    className="px-3 py-1 bg-steel-gray/20 text-white rounded disabled:opacity-50 hover:bg-steel-gray/30 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}

              <div className="text-steel-gray text-sm">
                {Math.min((currentPage - 1) * imagesPerPage + 1, paginatedPhotos.total)}–
                {Math.min(currentPage * imagesPerPage, paginatedPhotos.total)} of{' '}
                {paginatedPhotos.total}
              </div>
            </div>

            <PhotoSwipeGallery
              options={{
                zoom: true,
                showHideAnimationType: 'fade',
                bgOpacity: 0.95,
                pinchToClose: true,
                closeOnVerticalDrag: true,
                padding: { top: 20, bottom: 20, left: 20, right: 20 },
                maxWidthToAnimate: 400,
                hideAnimationDuration: 300,
                showAnimationDuration: 300,
                zoomAnimationDuration: 300,
                errorMsg: 'The image could not be loaded',
                preload: [1, 2],
                allowPanToNext: true,
                spacing: 0.1,
                loop: true,
                wheelToZoom: true,
              }}
            >
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AnimatePresence mode="wait">
                  {paginatedPhotos.images.map((image, index) => (
                    <ImageWithDimensions
                      key={image.id}
                      src={image.src}
                      thumbnail={image.thumbnail}
                      width={image.width}
                      height={image.height}
                      alt={image.alt}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </PhotoSwipeGallery>

            {paginatedPhotos.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-steel-gray/20 text-white rounded disabled:opacity-50 hover:bg-steel-gray/30 transition-colors"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-steel-gray/20 text-white rounded disabled:opacity-50 hover:bg-steel-gray/30 transition-colors"
                >
                  ← Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, paginatedPhotos.totalPages) }, (_, i) => {
                    let pageNum
                    if (paginatedPhotos.totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= paginatedPhotos.totalPages - 2) {
                      pageNum = paginatedPhotos.totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded transition-colors ${
                          currentPage === pageNum
                            ? 'bg-steel-blue text-white'
                            : 'bg-steel-gray/20 text-white hover:bg-steel-gray/30'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(paginatedPhotos.totalPages, p + 1))
                  }
                  disabled={currentPage === paginatedPhotos.totalPages}
                  className="px-3 py-1 bg-steel-gray/20 text-white rounded disabled:opacity-50 hover:bg-steel-gray/30 transition-colors"
                >
                  Next →
                </button>
                <button
                  onClick={() => setCurrentPage(paginatedPhotos.totalPages)}
                  disabled={currentPage === paginatedPhotos.totalPages}
                  className="px-3 py-1 bg-steel-gray/20 text-white rounded disabled:opacity-50 hover:bg-steel-gray/30 transition-colors"
                >
                  Last
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default LocalGallery
