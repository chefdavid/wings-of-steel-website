import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaCheck, FaTimes, FaCalendarAlt, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';
import { schedule2026_2027, SEASON_LABEL } from '../../data/schedule-2026-2027';

interface ImportStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  details?: string[];
  warnings?: string[];
}

// Natural key for a game. Two games can share a date (2/27/27 is a
// doubleheader), so the time has to be part of it.
const gameKey = (date: string, time: string) => `${date}|${time.slice(0, 5)}`;

const seasonWindow = () => {
  const dates = schedule2026_2027.map(g => g.game_date).sort();
  return { first: dates[0], last: dates[dates.length - 1] };
};

const ScheduleBulkImport = () => {
  const [status, setStatus] = useState<ImportStatus>({ type: 'idle' });
  const [previewGames, setPreviewGames] = useState(false);

  const importSchedule = async () => {
    setStatus({ type: 'loading', message: 'Importing schedule...' });

    try {
      const { first, last } = seasonWindow();

      // Resolve the season row so every game carries season_id, not just the
      // free-text label.
      const { data: seasonRow, error: seasonError } = await supabase
        .from('seasons')
        .select('id')
        .eq('label', SEASON_LABEL)
        .maybeSingle();

      if (seasonError) {
        throw new Error(`Could not look up season "${SEASON_LABEL}": ${seasonError.message}`);
      }
      const seasonId = seasonRow?.id ?? null;

      // What is already in the database for this season's date range?
      const { data: existingGames, error: fetchError } = await supabase
        .from('game_schedules')
        .select('id, game_date, game_time, opponent')
        .gte('game_date', first)
        .lte('game_date', last);

      if (fetchError) {
        throw new Error(`Could not read existing games: ${fetchError.message}`);
      }

      const existingByKey = new Map<string, { id: string; opponent: string | null }>();
      (existingGames || []).forEach(g => {
        existingByKey.set(gameKey(g.game_date, g.game_time), { id: g.id, opponent: g.opponent });
      });

      let inserted = 0;
      let updated = 0;
      const warnings: string[] = [];

      for (const game of schedule2026_2027) {
        const payload = {
          game_date: game.game_date,
          game_time: game.game_time,
          opponent: game.opponent,
          location: game.location,
          home_away: game.home_away,
          game_type: game.game_type ?? null,
          notes: game.notes ?? null,
          season: SEASON_LABEL,
          season_id: seasonId,
          is_active: true
        };

        const match = existingByKey.get(gameKey(game.game_date, game.game_time));

        if (match) {
          // UPDATE, never delete-and-recreate. The row's id is the join key for
          // game_highlights, player_game_stats and the game-photos bucket, so
          // recreating it would orphan every recap attached to this game.
          const { error } = await supabase
            .from('game_schedules')
            .update(payload)
            .eq('id', match.id);

          if (error) throw new Error(`Failed to update ${game.game_date}: ${error.message}`);
          updated++;
          existingByKey.delete(gameKey(game.game_date, game.game_time));
        } else {
          const { error } = await supabase
            .from('game_schedules')
            .insert([{ ...payload, status: 'Scheduled' }]);

          if (error) throw new Error(`Failed to add ${game.game_date}: ${error.message}`);
          inserted++;
        }
      }

      // Anything left over is in the database but not in the import file. It is
      // reported, never deleted - it may be a game the coaches added by hand.
      for (const [key, leftover] of existingByKey) {
        const [date, time] = key.split('|');
        warnings.push(`In database but not in the import file: ${date} ${time} vs ${leftover.opponent || 'TBD'} - review and remove by hand if it is stale.`);
      }

      setStatus({
        type: 'success',
        message: `Schedule imported. ${inserted} added, ${updated} updated.`,
        details: [
          `Season: ${SEASON_LABEL}`,
          `Games in file: ${schedule2026_2027.length}`,
          `Date range: ${first} to ${last}`,
          'No games were deleted, so all existing recaps and player stats are intact.'
        ],
        warnings
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Import failed',
        details: [error instanceof Error ? error.message : 'Unknown error occurred']
      });
    }
  };

  const formatGameDate = (dateStr: string) => {
    // 'T00:00:00' keeps this at local midnight. Without it the string parses as
    // UTC and renders as the previous day for anyone west of Greenwich.
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Bulk Import {SEASON_LABEL} Schedule
        </h3>
        <p className="text-gray-600">
          Import the complete {SEASON_LABEL} season schedule. Games already in the database are
          updated in place; new games are added.
        </p>
      </div>

      {/* Preview Toggle */}
      <div className="mb-6">
        <button
          onClick={() => setPreviewGames(!previewGames)}
          className="text-steel-blue hover:text-blue-700 underline text-sm"
        >
          {previewGames ? 'Hide' : 'Show'} games to import ({schedule2026_2027.length} games)
        </button>

        {previewGames && (
          <div className="mt-4 max-h-96 overflow-y-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Time</th>
                  <th className="px-3 py-2 text-left">Opponent</th>
                  <th className="px-3 py-2 text-left">Location</th>
                  <th className="px-3 py-2 text-center">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {schedule2026_2027.map((game, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{formatGameDate(game.game_date)}</td>
                    <td className="px-3 py-2">{formatTime(game.game_time)}</td>
                    <td className="px-3 py-2">{game.opponent}</td>
                    <td className="px-3 py-2 text-xs">{game.location}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        game.home_away === 'home'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {game.home_away?.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {status.type !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg ${
            status.type === 'loading' ? 'bg-blue-50 border border-blue-200' :
            status.type === 'success' ? 'bg-green-50 border border-green-200' :
            'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {status.type === 'loading' && (
              <div className="animate-spin text-blue-600">
                <FaCalendarAlt className="text-xl" />
              </div>
            )}
            {status.type === 'success' && (
              <FaCheck className="text-green-600 text-xl" />
            )}
            {status.type === 'error' && (
              <FaTimes className="text-red-600 text-xl" />
            )}

            <div className="flex-1">
              <p className={`font-medium ${
                status.type === 'loading' ? 'text-blue-900' :
                status.type === 'success' ? 'text-green-900' :
                'text-red-900'
              }`}>
                {status.message}
              </p>
              {status.details && (
                <ul className="mt-2 text-sm space-y-1">
                  {status.details.map((detail, index) => (
                    <li key={index} className={
                      status.type === 'success' ? 'text-green-700' : 'text-red-700'
                    }>
                      • {detail}
                    </li>
                  ))}
                </ul>
              )}
              {status.warnings && status.warnings.length > 0 && (
                <ul className="mt-3 pt-3 border-t border-green-200 text-sm space-y-1">
                  {status.warnings.map((warning, index) => (
                    <li key={index} className="text-amber-700">⚠ {warning}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Safety Message */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <FaShieldAlt className="text-blue-600 text-xl flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">This import is safe to re-run:</p>
            <ul className="text-blue-800 space-y-1">
              <li>• Existing games are matched on date + time and updated in place</li>
              <li>• Nothing is deleted, so game recaps, photos and player stats stay attached</li>
              <li>• Games from other seasons are never touched</li>
              <li>• Extra games found in the date range are reported, not removed</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <FaExclamationTriangle className="text-yellow-600 text-xl flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-900 mb-1">Before you import:</p>
            <ul className="text-yellow-800 space-y-1">
              <li>• Changing a game's date or time creates a new row rather than moving the old one — edit those by hand so the recap stays attached</li>
              <li>• {schedule2026_2027.length} games will be written, from {seasonWindow().first} to {seasonWindow().last}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Import Button */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={importSchedule}
          disabled={status.type === 'loading'}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            status.type === 'loading'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-steel-blue text-white hover:bg-blue-600'
          }`}
        >
          <FaUpload />
          {status.type === 'loading' ? 'Importing...' : `Import ${SEASON_LABEL} Schedule`}
        </motion.button>

        {status.type === 'success' && (
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Refresh Page
          </button>
        )}
      </div>
    </div>
  );
};

export default ScheduleBulkImport;
