import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Season } from './useGameSchedule';

/**
 * The season being played right now.
 *
 * Seasons run **September through August**. Anything that renders schedule data
 * should scope itself to this range, otherwise last season's fixtures show up
 * alongside this year's as though they were the same campaign.
 *
 * Prefer this over `useGameSchedule().currentSeason` when you only need the
 * season - it reads one small table instead of every game ever played.
 */
export function useCurrentSeason() {
  const [season, setSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeason = async () => {
      try {
        const { data, error } = await supabase
          .from('seasons')
          .select('id, label, start_date, end_date, is_current')
          .order('start_date', { ascending: true });

        if (error || !data || data.length === 0) {
          // No seasons table or no rows: leave season null. Callers treat that
          // as "do not filter" so the page degrades to showing everything
          // rather than showing nothing.
          return;
        }

        const now = new Date();
        const iso = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'America/New_York',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(now);

        // The flag is the intent; the date range is the safety net for when
        // nobody remembered to flip it over the summer.
        setSeason(
          data.find(s => s.is_current) ||
          data.find(s => iso >= s.start_date && iso <= s.end_date) ||
          data[data.length - 1]
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSeason();
  }, []);

  return { season, loading };
}
