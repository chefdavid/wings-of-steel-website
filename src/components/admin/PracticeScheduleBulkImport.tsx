import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaCheck, FaTimes, FaCalendarAlt, FaShieldAlt } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';
import { practices2026_2027, SEASON_LABEL } from '../../data/schedule-2026-2027';

interface ImportStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  details?: string[];
  warnings?: string[];
}

interface Props {
  onImported?: () => void;
}

// One practice per day, so the date alone is the natural key.
const practiceWindow = () => {
  const dates = practices2026_2027.map(p => p.practice_date!).sort();
  return { first: dates[0], last: dates[dates.length - 1] };
};

const PracticeScheduleBulkImport = ({ onImported }: Props) => {
  const [status, setStatus] = useState<ImportStatus>({ type: 'idle' });
  const [showPreview, setShowPreview] = useState(false);

  const importPractices = async () => {
    setStatus({ type: 'loading', message: 'Importing practice schedule...' });

    try {
      const { first, last } = practiceWindow();

      const { data: seasonRow, error: seasonError } = await supabase
        .from('seasons')
        .select('id')
        .eq('label', SEASON_LABEL)
        .maybeSingle();

      if (seasonError) {
        throw new Error(`Could not look up season "${SEASON_LABEL}": ${seasonError.message}`);
      }
      const seasonId = seasonRow?.id ?? null;

      // Existing rows can be keyed on practice_date OR effective_from - older
      // rows only ever filled one of them in.
      const { data: existing, error: fetchError } = await supabase
        .from('practice_schedules')
        .select('id, practice_date, effective_from, start_time');

      if (fetchError) {
        throw new Error(`Could not read existing practices: ${fetchError.message}`);
      }

      const existingByDate = new Map<string, string>();
      (existing || []).forEach(row => {
        const date = row.practice_date || row.effective_from;
        if (date && date >= first && date <= last) {
          existingByDate.set(date, row.id);
        }
      });

      let inserted = 0;
      let updated = 0;

      for (const practice of practices2026_2027) {
        const date = practice.practice_date!;
        const payload = {
          practice_date: date,
          // All three date columns are written on purpose: the admin reads
          // practice_date, /practice-schedule filters on effective_to, and the
          // home page Location section renders effective_from. Fill only one
          // and the practice silently disappears from the public site.
          effective_from: date,
          effective_to: date,
          day_of_week: practice.day_of_week,
          day_order: practice.day_order,
          start_time: practice.start_time,
          end_time: practice.end_time,
          team_type: practice.team_type,
          location: practice.location,
          rink: practice.rink,
          description: practice.description,
          notes: practice.notes,
          season: SEASON_LABEL,
          season_id: seasonId,
          is_active: true
        };

        const existingId = existingByDate.get(date);

        if (existingId) {
          const { error } = await supabase
            .from('practice_schedules')
            .update(payload)
            .eq('id', existingId);

          if (error) throw new Error(`Failed to update ${date}: ${error.message}`);
          updated++;
          existingByDate.delete(date);
        } else {
          const { error } = await supabase
            .from('practice_schedules')
            .insert([payload]);

          if (error) throw new Error(`Failed to add ${date}: ${error.message}`);
          inserted++;
        }
      }

      const warnings = Array.from(existingByDate.keys())
        .sort()
        .map(date => `In database but not on the flyer: ${date} - review and remove by hand if it is stale.`);

      setStatus({
        type: 'success',
        message: `Practice schedule imported. ${inserted} added, ${updated} updated.`,
        details: [
          `Season: ${SEASON_LABEL}`,
          `Practices in file: ${practices2026_2027.length}`,
          `Date range: ${first} to ${last}`,
          'Every row was written with practice_date, effective_from and effective_to set, so practices show on the home page and the practice page.'
        ],
        warnings
      });

      onImported?.();
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Import failed',
        details: [error instanceof Error ? error.message : 'Unknown error occurred']
      });
    }
  };

  const formatDate = (dateStr: string) => {
    // Local midnight - see the note in ScheduleBulkImport.
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
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
          Bulk Import {SEASON_LABEL} Practice Schedule
        </h3>
        <p className="text-gray-600">
          Import all {practices2026_2027.length} practices from the {SEASON_LABEL} team flyer.
          Practices already in the database are updated in place; new ones are added.
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="text-steel-blue hover:text-blue-700 underline text-sm"
        >
          {showPreview ? 'Hide' : 'Show'} practices to import ({practices2026_2027.length})
        </button>

        {showPreview && (
          <div className="mt-4 max-h-96 overflow-y-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Start</th>
                  <th className="px-3 py-2 text-left">End</th>
                  <th className="px-3 py-2 text-left">Surface</th>
                  <th className="px-3 py-2 text-left">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {practices2026_2027.map((practice, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{formatDate(practice.practice_date!)}</td>
                    <td className="px-3 py-2">{formatTime(practice.start_time)}</td>
                    <td className="px-3 py-2">{formatTime(practice.end_time)}</td>
                    <td className="px-3 py-2 text-xs">{practice.rink}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{practice.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
            {status.type === 'success' && <FaCheck className="text-green-600 text-xl" />}
            {status.type === 'error' && <FaTimes className="text-red-600 text-xl" />}

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
                    <li key={index} className={status.type === 'success' ? 'text-green-700' : 'text-red-700'}>
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

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <FaShieldAlt className="text-blue-600 text-xl flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">This import is safe to re-run:</p>
            <ul className="text-blue-800 space-y-1">
              <li>• Existing practices are matched on date and updated in place</li>
              <li>• Nothing is deleted</li>
              <li>• Practices outside {practiceWindow().first} to {practiceWindow().last} are never touched</li>
            </ul>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={importPractices}
        disabled={status.type === 'loading'}
        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
          status.type === 'loading'
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-steel-blue text-white hover:bg-blue-600'
        }`}
      >
        <FaUpload />
        {status.type === 'loading' ? 'Importing...' : `Import ${SEASON_LABEL} Practices`}
      </motion.button>
    </div>
  );
};

export default PracticeScheduleBulkImport;
