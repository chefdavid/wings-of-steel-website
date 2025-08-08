import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Game } from '../types/database';

export function useGameSchedule() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('game_schedules')
          .select('*')
          .order('game_date', { ascending: true })
          .order('game_time', { ascending: true });

        if (error) throw error;

        if (data) {
          setGames(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const { pastGames, upcomingGames } = useMemo(() => {
    const now = new Date();
    const past: Game[] = [];
    const upcoming: Game[] = [];

    games.forEach(game => {
      // Use game_date if available, fallback to date for legacy
      const gameDate = game.game_date || game.date;
      if (gameDate && new Date(gameDate) < now) {
        past.push(game);
      } else {
        upcoming.push(game);
      }
    });

    return { pastGames: past, upcomingGames: upcoming };
  }, [games]);

  return { games, pastGames, upcomingGames, loading, error };
}