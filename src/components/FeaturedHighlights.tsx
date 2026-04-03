import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaStar, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useGameHighlights, useGameSchedule } from '../hooks';
import type { GameHighlight, Game } from '../types/database';

export default function FeaturedHighlights() {
  const { fetchFeaturedHighlights } = useGameHighlights();
  const { games } = useGameSchedule();
  const [featured, setFeatured] = useState<GameHighlight[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchFeaturedHighlights().then((data) => {
      setFeatured(data);
      setLoaded(true);
    });
  }, [fetchFeaturedHighlights]);

  if (!loaded || featured.length === 0) return null;

  const getGameInfo = (highlight: GameHighlight): { opponent: string; date: string; linkId: string } => {
    if (highlight.game_id) {
      const game = games.find((g) => g.id === highlight.game_id);
      if (game) {
        return {
          opponent: game.opponent,
          date: game.game_date || game.date || '',
          linkId: game.id,
        };
      }
    }
    return {
      opponent: highlight.opponent || 'Opponent',
      date: highlight.game_date || '',
      linkId: highlight.id,
    };
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <section className="py-12 bg-gradient-to-b from-dark-steel to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <FaTrophy className="text-yellow-400 text-2xl" />
            <h2 className="text-3xl md:text-4xl font-sport text-white">Featured Highlights</h2>
            <FaTrophy className="text-yellow-400 text-2xl" />
          </div>
          <p className="text-ice-blue text-sm">Top moments from the season</p>
        </motion.div>

        <div className={`grid gap-6 ${
          featured.length === 1 ? 'grid-cols-1 max-w-lg mx-auto' :
          featured.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' :
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {featured.map((highlight, i) => {
            const info = getGameInfo(highlight);
            const photoUrl = highlight.featured_photo_url || (highlight.photos?.[0]?.url);

            return (
              <motion.div
                key={highlight.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true }}
              >
                <Link to={`/game/${info.linkId}`} className="group block">
                  <div className="relative rounded-xl overflow-hidden bg-steel-gray/30 border border-steel-blue/20 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-400/10">
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={highlight.title || `vs ${info.opponent}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-steel-blue to-dark-steel flex items-center justify-center">
                          <FaTrophy className="text-white/20 text-6xl" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Featured Badge */}
                      <div className="absolute top-3 left-3 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                        <FaStar className="text-xs" /> Featured
                      </div>

                      {/* Score */}
                      {highlight.final_score && (
                        <div className="absolute top-3 right-3 bg-white/90 text-dark-steel font-bold px-3 py-1 rounded text-sm">
                          {highlight.final_score}
                        </div>
                      )}

                      {/* Title overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">
                          {highlight.title || `Wings of Steel vs ${info.opponent}`}
                        </h3>
                        <p className="text-ice-blue text-xs mt-1">
                          {info.opponent && `vs ${info.opponent}`}
                          {info.date && ` · ${formatDate(info.date)}`}
                        </p>
                      </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="px-4 py-3 flex items-center justify-between">
                      {highlight.summary && (
                        <p className="text-gray-300 text-xs line-clamp-1 flex-1 mr-2">{highlight.summary}</p>
                      )}
                      <span className="text-yellow-400 text-sm font-semibold flex items-center gap-1 flex-shrink-0 group-hover:gap-2 transition-all">
                        View <FaArrowRight className="text-xs" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Link
            to="/game-highlights"
            className="inline-flex items-center gap-2 text-ice-blue hover:text-yellow-400 transition-colors font-semibold"
          >
            View All Game Highlights <FaArrowRight />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
