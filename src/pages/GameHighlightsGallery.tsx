import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaStar } from 'react-icons/fa';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import GameHighlightsPreview from '../components/GameHighlightsPreview';
import LoadingSpinner from '../components/LoadingSpinner';
import { useGameHighlights } from '../hooks/useGameHighlights';
import { supabase } from '../lib/supabaseClient';
import type { Game, GameHighlight } from '../types/database';

const ITEMS_PER_PAGE = 6;

function buildGameForHighlight(highlight: GameHighlight, games: Game[]): Game | null {
  if (highlight.game_id) {
    return games.find((g) => g.id === highlight.game_id) || null;
  }
  // Standalone highlight - build a pseudo-Game from its fields
  return {
    id: highlight.id,
    game_date: highlight.game_date || '',
    game_time: highlight.game_time || '',
    opponent: highlight.opponent || 'Unknown',
    location: highlight.game_location || '',
    home_away: highlight.home_away,
    game_type: highlight.game_type,
  } as Game;
}

export default function GameHighlightsGallery() {
  const { highlights, loading: highlightsLoading } = useGameHighlights();
  const [games, setGames] = useState<Game[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setGamesLoading(true);
      const { data, error } = await supabase
        .from('game_schedules')
        .select('*')
        .order('game_date', { ascending: false });

      if (error) throw error;
      setGames(data || []);
    } catch (err) {
      console.error('Error fetching games:', err);
    } finally {
      setGamesLoading(false);
    }
  };

  // Build highlight entries, supporting both scheduled and standalone games
  const allHighlightEntries = highlights
    .map((highlight) => {
      const game = buildGameForHighlight(highlight, games);
      return game ? { game, highlight } : null;
    })
    .filter((item): item is { game: Game; highlight: GameHighlight } => item !== null);

  // Split into featured and regular
  const featuredEntries = allHighlightEntries.filter((e) => e.highlight.is_featured);
  const regularEntries = allHighlightEntries.filter((e) => !e.highlight.is_featured);

  const visibleRegular = regularEntries.slice(0, displayCount);
  const hasMore = displayCount < regularEntries.length;

  const loadMore = () => {
    setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const loading = highlightsLoading || gamesLoading;
  const totalCount = allHighlightEntries.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-steel-blue via-dark-steel to-steel-blue text-white pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <FaTrophy className="text-5xl text-yellow-400" />
              <h1 className="text-5xl md:text-6xl font-sport">Game Highlights</h1>
            </div>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Relive the action from Wings of Steel games. Browse game recaps, photos, and memorable moments from our season.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        ) : totalCount === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-600 mb-2">No Game Highlights Yet</h2>
            <p className="text-gray-500">Check back soon for game recaps and highlights!</p>
          </motion.div>
        ) : (
          <>
            {/* Featured Highlights (pinned to top) */}
            {featuredEntries.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <FaStar className="text-yellow-500 text-xl" />
                  <h2 className="text-2xl font-sport text-dark-steel">Featured</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredEntries.map(({ game, highlight }, index) => (
                    <GameHighlightsPreview
                      key={highlight.id}
                      game={game}
                      highlight={highlight}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Highlights */}
            {regularEntries.length > 0 && (
              <>
                {featuredEntries.length > 0 && (
                  <h2 className="text-2xl font-sport text-dark-steel mb-6">All Highlights</h2>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {visibleRegular.map(({ game, highlight }, index) => (
                    <GameHighlightsPreview
                      key={highlight.id}
                      game={game}
                      highlight={highlight}
                      index={index}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Load More Button */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <button
                  onClick={loadMore}
                  className="px-8 py-4 bg-steel-blue text-white rounded-full hover:bg-steel-blue/80 transition-all duration-200 font-sport tracking-wider shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Load More ({regularEntries.length - displayCount} remaining)
                </button>
              </motion.div>
            )}

            {/* Stats Summary */}
            <div className="mt-12 text-center text-gray-600">
              <p>
                Showing {featuredEntries.length + visibleRegular.length} of {totalCount} game highlights
              </p>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
