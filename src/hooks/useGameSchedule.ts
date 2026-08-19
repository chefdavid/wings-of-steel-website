import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Game } from '../types/database';

export interface Season {
  id: string;
  label: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

/**
 * Games, split by season.
 *
 * The season runs **September through August**, not January to December, so a
 * game in February belongs to the season that started the previous autumn.
 * The boundaries live in the `seasons` table rather than being computed here,
 * and games are matched to a season **by date**, not by the `season` text
 * column - that column has drifted between '2025-2026', '2025-26' and null over
 * the years, and a date range cannot drift.
 *
 * What each field is for:
 * - `games`         every game ever. Use for archives and for resolving a game
 *                   by id (admin recap editor, /game/:gameId).
 * - `seasonGames`   just the current season.
 * - `pastGames` /
 *   `upcomingGames` the current season, split at the cutoff. These are what the
 *                   public schedule and the today-banner should render, so last
 *                   season's fixtures never appear as if they were this year's.
 */
export function useGameSchedule() {
  const [games, setGames] = useState<Game[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const [gamesResult, seasonsResult] = await Promise.all([
          supabase
            .from('game_schedules')
            .select('*')
            .order('game_date', { ascending: true })
            .order('game_time', { ascending: true }),
          supabase
            .from('seasons')
            .select('id, label, start_date, end_date, is_current')
            .order('start_date', { ascending: true })
        ]);

        if (gamesResult.error) throw gamesResult.error;
        // A missing seasons table should not blank the schedule - fall back to
        // showing everything rather than showing nothing.
        if (!seasonsResult.error && seasonsResult.data) {
          setSeasons(seasonsResult.data);
        }

        if (gamesResult.data) {
          setGames(gamesResult.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Today in America/New_York, as YYYY-MM-DD and as Y/M/D parts. Everything
  // date-related on this site is anchored to the rink's timezone, never the
  // visitor's, so a fan in California does not see a game flip to "past" early.
  const estToday = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hour12: false
    });

    const parts = formatter.formatToParts(new Date());
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '0');
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '0');
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '0');
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');

    const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { year, month, day, hour, iso };
  }, []);

  const currentSeason = useMemo<Season | null>(() => {
    if (seasons.length === 0) return null;
    // The flag is the intent, but a stale flag should not hide the live season,
    // so fall back to whichever season actually contains today.
    return (
      seasons.find(s => s.is_current) ||
      seasons.find(s => estToday.iso >= s.start_date && estToday.iso <= s.end_date) ||
      seasons[seasons.length - 1]
    );
  }, [seasons, estToday]);

  const seasonGames = useMemo(() => {
    if (!currentSeason) return games;
    return games.filter(game => {
      const date = game.game_date || game.date;
      if (!date) return false;
      return date >= currentSeason.start_date && date <= currentSeason.end_date;
    });
  }, [games, currentSeason]);

  const { pastGames, upcomingGames } = useMemo(() => {
    const past: Game[] = [];
    const upcoming: Game[] = [];

    seasonGames.forEach(game => {
      const gameDate = game.game_date || game.date;
      if (!gameDate) {
        upcoming.push(game);
        return;
      }

      // 'T00:00:00' parses at local midnight. Bare 'YYYY-MM-DD' would parse as
      // UTC and land on the previous day west of Greenwich.
      const gameDateObj = new Date(gameDate + 'T00:00:00');
      const gameYear = gameDateObj.getFullYear();
      const gameMonth = gameDateObj.getMonth();
      const gameDay = gameDateObj.getDate();

      // A game stays "upcoming" until 1 AM the following day, so it is still
      // featured while everyone is driving home from the rink.
      const cutoffDate = new Date(gameYear, gameMonth, gameDay + 1);
      const cutoffYear = cutoffDate.getFullYear();
      const cutoffMonth = cutoffDate.getMonth() + 1;
      const cutoffDay = cutoffDate.getDate();

      const isAfterCutoff =
        estToday.year > cutoffYear ||
        (estToday.year === cutoffYear && estToday.month > cutoffMonth) ||
        (estToday.year === cutoffYear && estToday.month === cutoffMonth && estToday.day > cutoffDay) ||
        (estToday.year === cutoffYear && estToday.month === cutoffMonth && estToday.day === cutoffDay && estToday.hour >= 1);

      if (isAfterCutoff) {
        past.push(game);
      } else {
        upcoming.push(game);
      }
    });

    return { pastGames: past, upcomingGames: upcoming };
  }, [seasonGames, estToday]);

  return {
    games,
    seasons,
    currentSeason,
    seasonGames,
    pastGames,
    upcomingGames,
    loading,
    error
  };
}
