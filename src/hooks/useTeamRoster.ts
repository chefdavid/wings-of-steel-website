import { useEffect, useState } from 'react';
import { getTeamPlayers } from '../utils/teamQueries';
import { useTeam } from './useTeam';
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
  }, [currentTeam]);

  return { players, loading, error };
}