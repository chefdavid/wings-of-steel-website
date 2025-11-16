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
    // Get current date and time in EST/EDT
    const getESTDateTime = () => {
      const now = new Date();
      // Format current time in EST/EDT timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      const parts = formatter.formatToParts(now);
      const year = parseInt(parts.find(p => p.type === 'year')?.value || '0');
      const month = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1;
      const day = parseInt(parts.find(p => p.type === 'day')?.value || '0');
      const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
      const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
      const second = parseInt(parts.find(p => p.type === 'second')?.value || '0');
      
      return { date: new Date(year, month, day), hour, minute, second };
    };
    
    const estNow = getESTDateTime();
    const estDate = estNow.date;
    const estHour = estNow.hour;
    
    const past: Game[] = [];
    const upcoming: Game[] = [];

    games.forEach(game => {
      // Use game_date if available, fallback to date for legacy
      const gameDate = game.game_date || game.date;
      if (gameDate) {
        // Parse game date
        const gameDateObj = new Date(gameDate + 'T00:00:00');
        const gameYear = gameDateObj.getFullYear();
        const gameMonth = gameDateObj.getMonth();
        const gameDay = gameDateObj.getDate();
        
        // Cutoff is the day after the game at 1 AM EST
        const cutoffDate = new Date(gameYear, gameMonth, gameDay + 1);
        const cutoffYear = cutoffDate.getFullYear();
        const cutoffMonth = cutoffDate.getMonth();
        const cutoffDay = cutoffDate.getDate();
        
        // Compare: check if current EST is past the cutoff (game date + 1 day at 1 AM EST)
        const estDateYear = estDate.getFullYear();
        const estDateMonth = estDate.getMonth();
        const estDateDay = estDate.getDate();
        
        // Check if we're past 1 AM EST on the day after the game
        const isAfterCutoff = 
          (estDateYear > cutoffYear) ||
          (estDateYear === cutoffYear && estDateMonth > cutoffMonth) ||
          (estDateYear === cutoffYear && estDateMonth === cutoffMonth && estDateDay > cutoffDay) ||
          (estDateYear === cutoffYear && estDateMonth === cutoffMonth && estDateDay === cutoffDay && estHour >= 1);
        
        if (isAfterCutoff) {
          past.push(game);
        } else {
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