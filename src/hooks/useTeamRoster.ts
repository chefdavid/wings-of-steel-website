import { useEffect, useState } from 'react';
import { getTeamPlayers } from '../utils/teamQueries';
import { useTeam } from './useTeam';
import { supabase } from '../lib/supabaseClient';
import type { PlayerWithTeams } from '../types/database';

export function useTeamRoster() {
  const [players, setPlayers] = useState<PlayerWithTeams[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentTeam } = useTeam();

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch players for the current team
        const teamPlayers = await getTeamPlayers(currentTeam);
        setPlayers(teamPlayers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();

    // Subscribe to real-time updates for the team_roster table
    const subscription = supabase
      .channel('team_roster_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'team_roster'
        },
        () => {
          // Refetch players when any change occurs
          fetchPlayers();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [currentTeam]);

  return { players, loading, error };
}