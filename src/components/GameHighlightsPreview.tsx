import { motion } from 'framer-motion';
import { FaTrophy, FaStar, FaImages, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import type { Game, GameHighlight } from '../types/database';

interface GameHighlightsPreviewProps {
  game: Game;
  highlight: GameHighlight;
  index?: number;
}

export default function GameHighlightsPreview({ game, highlight, index = 0 }: GameHighlightsPreviewProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: date.getDate(),
    };
  };

  const dateInfo = formatDate(game.game_date || game.date || '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group"
    >
      <Link to={`/game/${game.id}`}>
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
          {/* Header with Image or Gradient */}
          <div className="relative h-48 bg-gradient-to-br from-steel-blue via-dark-steel to-steel-blue overflow-hidden">
            {(highlight.featured_photo_url || (highlight.photos && highlight.photos.length > 0)) ? (
              <img
                src={highlight.featured_photo_url || highlight.photos[0].url}
                alt={highlight.title || `Game vs ${game.opponent}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <FaTrophy className="text-white text-6xl opacity-30" />
              </div>
            )}

            {/* Date Badge */}
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 text-center">
              <div className="text-2xl font-bold text-steel-blue">{dateInfo.day}</div>
              <div className="text-xs font-semibold text-gray-600">{dateInfo.month}</div>
            </div>

            {/* Score Badge */}
            {highlight.final_score && (
              <div className="absolute top-4 right-4 bg-yellow-400 text-black rounded-lg shadow-lg px-3 py-2 font-bold">
                {highlight.final_score}
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Title */}
            <h3 className="text-xl font-bold text-dark-steel mb-2 group-hover:text-steel-blue transition-colors line-clamp-2">
              {highlight.title || `Wings of Steel vs ${game.opponent}`}
            </h3>

            {/* Summary Preview */}
            {highlight.summary && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{highlight.summary}</p>
            )}

            {/* Stats Row */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              {highlight.player_highlights && highlight.player_highlights.length > 0 && (
                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-500" />
                  <span>{highlight.player_highlights.length} player highlights</span>
                </div>
              )}
              {highlight.photos && highlight.photos.length > 0 && (
                <div className="flex items-center gap-1">
                  <FaImages className="text-steel-blue" />
                  <span>{highlight.photos.length} photos</span>
                </div>
              )}
            </div>

            {/* View Details Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-steel-blue font-semibold group-hover:text-blue-700 transition-colors flex items-center gap-2">
                View Full Recap
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
