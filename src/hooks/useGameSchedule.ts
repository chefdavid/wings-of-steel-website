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

    const getGameDateTime = (game: Game) => {
      const datePart = game.game_date || game.date;
      if (!datePart) return null;

      // Force local midnight to avoid timezone conversions pushing the game into the previous day
      const date = new Date(`${datePart}T00:00:00`);
      const timePart = game.game_time;

      if (timePart) {
        const [hourStr, minuteStr] = timePart.split(':');
        const hours = Number(hourStr);
        const minutes = Number(minuteStr) || 0;

        if (!Number.isNaN(hours)) {
          date.setHours(hours, minutes, 0, 0);
        }
      }

      return date;
    };

    games.forEach(game => {
      const gameDateTime = getGameDateTime(game);

      if (!gameDateTime) {
        upcoming.push(game);
        return;
      }

      const gracePeriodEnd = new Date(gameDateTime);
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 2);

      if (gracePeriodEnd < now) {
        past.push(game);
      } else {
        upcoming.push(game);
      }
    });

    return { pastGames: past, upcomingGames: upcoming };
  }, [games]);

  return { games, pastGames, upcomingGames, loading, error };
}