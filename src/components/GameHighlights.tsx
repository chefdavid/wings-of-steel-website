import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaStar, FaClock, FaTimes, FaPlay, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import type { GameHighlight, Game } from '../types/database';

interface GameHighlightsProps {
  game: Game;
  highlight: GameHighlight;
}

export default function GameHighlights({ game, highlight }: GameHighlightsProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [photosToShow, setPhotosToShow] = useState(12);

  const openPhotoModal = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closePhotoModal = () => {
    setSelectedPhotoIndex(null);
  };

  const nextPhoto = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex < highlight.photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-steel-blue via-dark-steel to-steel-blue text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Game Info */}
            <div className="text-center mb-8">
              <div className="inline-block bg-yellow-400 text-black px-4 py-2 rounded-full font-bold text-sm uppercase mb-4">
                Game Recap
              </div>
              <h1 className="text-4xl md:text-5xl font-sport mb-4">
                {highlight.title || `Wings of Steel vs ${game.opponent}`}
              </h1>
              <p className="text-xl opacity-90">
                {formatDate(game.game_date || game.date || '')} • {game.location}
              </p>
            </div>

            {/* Final Score */}
            {highlight.final_score && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto"
              >
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="text-sm uppercase tracking-wide mb-2">Wings of Steel</div>
                    <div className="text-5xl font-bold">{highlight.final_score.split('-')[0]}</div>
                  </div>
                  <div className="text-3xl opacity-50">-</div>
                  <div className="text-center">
                    <div className="text-sm uppercase tracking-wide mb-2">{game.opponent}</div>
                    <div className="text-5xl font-bold">{highlight.final_score.split('-')[1]}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Game Summary */}
        {highlight.summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-dark-steel mb-4 flex items-center gap-2">
              <FaTrophy className="text-yellow-500" />
              Game Summary
            </h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">{highlight.summary}</p>
            </div>
          </motion.div>
        )}

        {/* Key Moments */}
        {highlight.key_moments && highlight.key_moments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-dark-steel mb-6 flex items-center gap-2">
              <FaClock className="text-steel-blue" />
              Key Moments
            </h2>
            <div className="space-y-4">
              {highlight.key_moments.map((moment, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="bg-white border-l-4 border-steel-blue rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-steel-blue text-white px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                      {moment.time}
                    </div>
                    <p className="text-gray-700 flex-1">{moment.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Player Highlights */}
        {highlight.player_highlights && highlight.player_highlights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-dark-steel mb-6 flex items-center gap-2">
              <FaStar className="text-yellow-500" />
              Player Highlights
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {highlight.player_highlights.map((playerHighlight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="bg-gradient-to-r from-yellow-50 to-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow border border-yellow-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-400 text-black p-2 rounded-full">
                      <FaStar className="text-lg" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-dark-steel">{playerHighlight.player_name}</h3>
                      <p className="text-gray-700">{playerHighlight.achievement}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Photos */}
        {highlight.photos && highlight.photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-dark-steel mb-6">
              Game Photos ({highlight.photos.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {highlight.photos
                .sort((a, b) => a.order - b.order)
                .slice(0, photosToShow)
                .map((photo, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.05 }}
                    className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow"
                    onClick={() => openPhotoModal(index)}
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || `Game photo ${index + 1}`}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 text-sm">
                        {photo.caption}
                      </div>
                    )}
                  </motion.div>
                ))}
            </div>
            {photosToShow < highlight.photos.length && (
              <div className="text-center">
                <button
                  onClick={() => setPhotosToShow(prev => prev + 12)}
                  className="px-8 py-4 bg-steel-blue text-white rounded-full hover:bg-steel-blue/80 transition-all duration-200 font-sport tracking-wider shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Load More Photos ({highlight.photos.length - photosToShow} remaining)
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Video */}
        {highlight.video_url && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-dark-steel mb-6 flex items-center gap-2">
              <FaPlay className="text-red-600" />
              Game Video
            </h2>
            <div className="bg-gray-100 rounded-xl p-4">
              <a
                href={highlight.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-steel-blue hover:text-blue-700 font-semibold text-lg"
              >
                <FaPlay />
                Watch Full Game Video
              </a>
            </div>
          </motion.div>
        )}
      </div>

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={closePhotoModal}
          >
            <button
              onClick={closePhotoModal}
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <FaTimes className="text-2xl" />
            </button>

            {selectedPhotoIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevPhoto();
                }}
                className="absolute left-4 text-white p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <FaChevronLeft className="text-2xl" />
              </button>
            )}

            {selectedPhotoIndex < highlight.photos.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextPhoto();
                }}
                className="absolute right-4 text-white p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <FaChevronRight className="text-2xl" />
              </button>
            )}

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-6xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={highlight.photos[selectedPhotoIndex].url}
                alt={highlight.photos[selectedPhotoIndex].caption || `Photo ${selectedPhotoIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              {highlight.photos[selectedPhotoIndex].caption && (
                <div className="bg-white text-center p-4 mt-4 rounded-lg">
                  <p className="text-gray-800">{highlight.photos[selectedPhotoIndex].caption}</p>
                </div>
              )}
              <div className="text-white text-center mt-2">
                Photo {selectedPhotoIndex + 1} of {highlight.photos.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
