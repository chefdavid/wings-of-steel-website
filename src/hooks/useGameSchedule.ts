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
    // Set to start of today for date comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const past: Game[] = [];
    const upcoming: Game[] = [];

    games.forEach(game => {
      // Use game_date if available, fallback to date for legacy
      const gameDate = game.game_date || game.date;
      if (gameDate) {
        // Parse game date and set to start of day for comparison
        const gameDateObj = new Date(gameDate);
        const gameDateOnly = new Date(gameDateObj.getFullYear(), gameDateObj.getMonth(), gameDateObj.getDate());
        
        // Games should show if they are today or within 2 days after the game date
        // Only move to past if more than 2 days have passed since the game date
        if (gameDateOnly < today) {
          // Check if more than 2 days have passed
          const daysDiff = Math.floor((today.getTime() - gameDateOnly.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff > 2) {
            past.push(game);
          } else {
            // Still within 2 days, show as upcoming
            upcoming.push(game);
          }
        } else {
          // Game is today or in the future
          upcoming.push(game);
        }
      } else {
        // No date, treat as upcoming
        upcoming.push(game);
      }
    });

    return { pastGames: past, upcomingGames: upcoming };
  }, [games]);

  return { games, pastGames, upcomingGames, loading, error };
}