import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const { getHighlightByGameId, getHighlightById } = useGameHighlights();

  const [game, setGame] = useState<Game | null>(null);
  const [highlight, setHighlight] = useState<GameHighlight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId || gamesLoading) return;

    const loadGameData = async () => {
      try {
        setLoading(true);

        // First try: find the game in the schedule
        const foundGame = games.find((g) => g.id === gameId);
        if (foundGame) {
          setGame(foundGame);
          const gameHighlight = await getHighlightByGameId(gameId);
          if (!gameHighlight) {
            setError('No highlights available for this game yet');
            setLoading(false);
            return;
          }
          setHighlight(gameHighlight);
          setLoading(false);
          return;
        }

        // Second try: this might be a standalone highlight ID
        const standaloneHighlight = await getHighlightById(gameId);
        if (standaloneHighlight) {
          setHighlight(standaloneHighlight);
          // Build a pseudo-Game from the highlight's fields
          setGame({
            id: standaloneHighlight.id,
            game_date: standaloneHighlight.game_date || '',
            game_time: standaloneHighlight.game_time || '',
            opponent: standaloneHighlight.opponent || 'Opponent',
            location: standaloneHighlight.game_location || '',
            home_away: standaloneHighlight.home_away,
            game_type: standaloneHighlight.game_type,
          } as Game);
          setLoading(false);
          return;
        }

        setError('Game not found');
      } catch (err) {
        setError('Failed to load game data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadGameData();
  }, [gameId, games, gamesLoading, getHighlightByGameId, getHighlightById]);

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
                onClick={() => navigate('/game-highlights')}
                className="inline-flex items-center gap-2 bg-steel-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaArrowLeft />
                Back to Highlights
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
              onClick={() => navigate('/game-highlights')}
              className="inline-flex items-center gap-2 text-steel-blue hover:text-blue-700 font-semibold transition-colors"
            >
              <FaArrowLeft />
              Back to Highlights
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
