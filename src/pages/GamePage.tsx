import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { useGameSchedule, useGameHighlights } from '../hooks';
import GameHighlights from '../components/GameHighlights';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import type { Game, GameHighlight } from '../types/database';

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { games, loading: gamesLoading } = useGameSchedule();
  const { getHighlightByGameId } = useGameHighlights();

  const [game, setGame] = useState<Game | null>(null);
  const [highlight, setHighlight] = useState<GameHighlight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId || gamesLoading) return;

    const loadGameData = async () => {
      try {
        setLoading(true);

        // Find the game
        const foundGame = games.find((g) => g.id === gameId);
        if (!foundGame) {
          setError('Game not found');
          setLoading(false);
          return;
        }
        setGame(foundGame);

        // Load highlights for this game
        const gameHighlight = await getHighlightByGameId(gameId);

        if (!gameHighlight) {
          setError('No highlights available for this game yet');
          setLoading(false);
          return;
        }

        setHighlight(gameHighlight);
      } catch (err) {
        setError('Failed to load game data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadGameData();
  }, [gameId, games, gamesLoading, getHighlightByGameId]);

  if (loading || gamesLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center">
            <FaSpinner className="animate-spin text-5xl text-steel-blue mx-auto mb-4" />
            <p className="text-gray-600">Loading game highlights...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !game || !highlight) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-dark-steel mb-4">
                {error || 'Game Not Found'}
              </h2>
              <p className="text-gray-600 mb-6">
                {error === 'No highlights available for this game yet'
                  ? 'Check back soon for game highlights and photos!'
                  : 'The game you are looking for could not be found.'}
              </p>
              <button
                onClick={() => navigate('/#schedule')}
                className="inline-flex items-center gap-2 bg-steel-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaArrowLeft />
                Back to Schedule
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Back Button */}
        <div className="bg-white border-b sticky top-20 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => navigate('/#schedule')}
              className="inline-flex items-center gap-2 text-steel-blue hover:text-blue-700 font-semibold transition-colors"
            >
              <FaArrowLeft />
              Back to Schedule
            </button>
          </div>
        </div>

        {/* Game Highlights Content */}
        <GameHighlights game={game} highlight={highlight} />
      </div>
      <Footer />
    </>
  );
}
