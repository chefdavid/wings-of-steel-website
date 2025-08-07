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
        
        // Current active roster names
        const activePlayerNames = [
          'Jack Ashby', 'Logan Ashby', 'Leina Beseler', 'Andrew Carmen',
          'Lily Corrigan', 'Autumn Donzuso', 'AJ Gonzales', 'Trevor Gregoire',
          'Colten Haas', 'Laurel Jastrzembski', 'Mikayla Johnson', 'Colton Naylor',
          'Shane Philipps', 'Colin Wiederholt'
        ];
        
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .in('name', activePlayerNames)
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