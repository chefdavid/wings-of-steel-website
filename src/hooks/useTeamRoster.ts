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
    const fetchPlayers = async (isInitialLoad = true) => {
      try {
        if (isInitialLoad) {
          setLoading(true);
        }
        setError(null);

        // Fetch players for the current team
        const teamPlayers = await getTeamPlayers(currentTeam);
        console.log('Fetched players:', teamPlayers.length, 'players');
        setPlayers(teamPlayers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setPlayers([]);
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        }
      }
    };

    fetchPlayers(true);

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
        (payload) => {
          console.log('Real-time update received:', payload);
          // Refetch players when any change occurs
          fetchPlayers(false);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [currentTeam]);

  const refetch = () => {
    const fetchPlayers = async () => {
      try {
        setError(null);
        const teamPlayers = await getTeamPlayers(currentTeam);
        console.log('Manual refetch - players:', teamPlayers.length);
        // Find Laurel and log her position
        const laurel = teamPlayers.find(p => p.first_name?.toLowerCase() === 'laurel');
        if (laurel) {
          console.log('Laurel\'s current position from DB:', laurel.position);
        }
        setPlayers(teamPlayers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };
    fetchPlayers();
  };

  return { players, loading, error, refetch };
}