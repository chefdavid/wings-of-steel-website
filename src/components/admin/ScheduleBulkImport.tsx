import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaCheck, FaTimes, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';
import { schedule2025_2026 } from '../../data/schedule-2025-2026';

interface ImportStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  details?: string[];
}

const ScheduleBulkImport = () => {
  const [status, setStatus] = useState<ImportStatus>({ type: 'idle' });
  const [previewGames, setPreviewGames] = useState(false);

  const clearExistingSeason = async () => {
    const { error } = await supabase
      .from('game_schedules')
      .delete()
      .gte('game_date', '2025-10-01')
      .lte('game_date', '2026-05-31');
    
    if (error) {
      throw new Error(`Failed to clear existing schedule: ${error.message}`);
    }
  };

  const importSchedule = async () => {
    setStatus({ type: 'loading', message: 'Importing schedule...' });
    
    try {
      // Clear existing 2025-2026 season games
      await clearExistingSeason();
      
      // Prepare games for insertion - matching actual database schema
      const gamesToInsert = schedule2025_2026.map(game => ({
        game_date: game.game_date,
        game_time: game.game_time,
        opponent: game.opponent,
        location: game.location,
        home_away: game.home_away,
        notes: game.notes || null,
        season: game.season,
        is_active: true
        // Note: database doesn't have 'status' column - use 'result' for game outcomes
      }));
      
      // Insert in batches
      const batchSize = 5;
      const results = [];
      
      for (let i = 0; i < gamesToInsert.length; i += batchSize) {
        const batch = gamesToInsert.slice(i, i + batchSize);
        
        const { data, error } = await supabase
          .from('game_schedules')
          .insert(batch)
          .select();
        
        if (error) {
          throw new Error(`Batch ${Math.floor(i / batchSize) + 1} failed: ${error.message}`);
        }
        
        results.push(...(data || []));
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      setStatus({
        type: 'success',
        message: `Successfully imported ${results.length} games!`,
        details: [
          `Season: 2025-2026`,
          `Games imported: ${results.length}`,
          `Date range: October 2025 - March 2026`
        ]
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
          Bulk Import 2025-2026 Schedule
        </h3>
        <p className="text-gray-600">
          Import the complete 2025-2026 season schedule. This will replace any existing games for this season.
        </p>
      </div>

      {/* Preview Toggle */}
      <div className="mb-6">
        <button
          onClick={() => setPreviewGames(!previewGames)}
          className="text-steel-blue hover:text-blue-700 underline text-sm"
        >
          {previewGames ? 'Hide' : 'Show'} games to import ({schedule2025_2026.length} games)
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
                {schedule2025_2026.map((game, index) => (
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
            </div>
          </div>
        </motion.div>
      )}

      {/* Warning Message */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <FaExclamationTriangle className="text-yellow-600 text-xl flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-900 mb-1">Important:</p>
            <ul className="text-yellow-800 space-y-1">
              <li>• This will delete all existing games for the 2025-2026 season</li>
              <li>• Games from other seasons will not be affected</li>
              <li>• The import includes {schedule2025_2026.length} games from October 2025 to March 2026</li>
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
          {status.type === 'loading' ? 'Importing...' : 'Import 2025-2026 Schedule'}
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