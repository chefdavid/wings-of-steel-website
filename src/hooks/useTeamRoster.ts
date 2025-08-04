import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Player } from '../types/database';

export function useTeamRoster() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .order('jersey_number', { ascending: true });

        if (error) throw error;

        if (data) {
          setPlayers(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  return { players, loading, error };
}