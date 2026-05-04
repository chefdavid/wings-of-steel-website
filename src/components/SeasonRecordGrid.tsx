import { motion } from 'framer-motion';
import { FaTrophy } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import type { GameHighlight } from '../types/database';

type GameLike = {
  id: string;
  opponent: string;
  result?: string | null;
  game_date?: string | null;
  date?: string | null;
};

interface SeasonRecordGridProps {
  pastGames: GameLike[];
  highlights: GameHighlight[];
}

const abbreviateOpponent = (opponent: string): string => {
  if (!opponent) return '';
  const cleaned = opponent.trim();
  if (cleaned.length <= 10) return cleaned;
  // Use initials if there are multiple words
  const words = cleaned.split(/\s+/);
  if (words.length > 1) {
    return words.map(w => w[0]).join('').toUpperCase().slice(0, 4);
  }
  return cleaned.slice(0, 8);
};

const formatShortDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  if (isNaN(date.getTime())) return '';
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
};

const parseScore = (result?: string | null): string => {
  if (!result) return '';
  // Format like "W 5-0" or "L 4-5" or "T 2-2"
  const parts = result.trim().split(/\s+/);
  if (parts.length >= 2) return parts.slice(1).join(' ');
  return '';
};

const getResultLetter = (result?: string | null): 'W' | 'L' | 'T' | null => {
  if (!result) return null;
  const first = result.trim()[0]?.toUpperCase();
  if (first === 'W' || first === 'L' || first === 'T') return first;
  return null;
};

const SeasonRecordGrid = ({ pastGames, highlights }: SeasonRecordGridProps) => {
  // Compute record
  let wins = 0;
  let losses = 0;
  let ties = 0;
  pastGames.forEach(g => {
    const letter = getResultLetter(g.result);
    if (letter === 'W') wins += 1;
    else if (letter === 'L') losses += 1;
    else if (letter === 'T') ties += 1;
  });

  // Sort oldest -> newest
  const sortedGames = [...pastGames].sort((a, b) => {
    const dateA = a.game_date || a.date || '';
    const dateB = b.game_date || b.date || '';
    return dateA.localeCompare(dateB);
  });

  const hasAnyResult = wins + losses + ties > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="mb-12"
    >
      <h3 className="text-3xl font-bold text-dark-steel mb-8 flex items-center gap-3">
        <FaTrophy className="text-yellow-500" />
        Season Record
      </h3>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        {hasAnyResult ? (
          <div className="text-2xl font-bold text-dark-steel mb-6">
            {wins}-{losses}-{ties}
            <span className="text-sm font-normal text-gray-500 ml-3">
              (W-L-T)
            </span>
          </div>
        ) : (
          <div className="text-base text-gray-500 mb-6">
            No completed games yet this season.
          </div>
        )}

        {sortedGames.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {sortedGames.map(game => {
              const letter = getResultLetter(game.result);
              const score = parseScore(game.result);
              const opponentAbbr = abbreviateOpponent(game.opponent);
              const dateShort = formatShortDate(game.game_date || game.date || '');

              const stripeColor =
                letter === 'W'
                  ? 'bg-green-600'
                  : letter === 'L'
                  ? 'bg-red-600'
                  : letter === 'T'
                  ? 'bg-gray-500'
                  : 'bg-gray-300';

              const letterColor =
                letter === 'W'
                  ? 'text-green-700'
                  : letter === 'L'
                  ? 'text-red-700'
                  : letter === 'T'
                  ? 'text-gray-700'
                  : 'text-gray-400';

              const tileInner = (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden h-20 flex flex-col transition-all duration-200 hover:scale-105 hover:shadow-lg">
                  <div className={`h-1.5 w-full ${stripeColor}`} />
                  <div className="flex-1 flex flex-col items-center justify-center px-1 py-1 text-center">
                    <div className={`text-base font-bold leading-none ${letterColor}`}>
                      {letter ?? '—'}
                    </div>
                    {score && (
                      <div className="text-xs font-semibold text-dark-steel leading-tight mt-0.5">
                        {score}
                      </div>
                    )}
                    <div className="text-[10px] text-gray-600 leading-tight mt-0.5 truncate w-full">
                      {opponentAbbr}
                    </div>
                    {dateShort && (
                      <div className="text-[10px] text-gray-400 leading-tight">
                        {dateShort}
                      </div>
                    )}
                  </div>
                </div>
              );

              const hasHighlight = !!highlights.find(
                h => h.game_id === game.id && h.is_published
              );

              return hasHighlight ? (
                <Link key={game.id} to={`/game/${game.id}`} className="block">
                  {tileInner}
                </Link>
              ) : (
                <div key={game.id}>{tileInner}</div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SeasonRecordGrid;
