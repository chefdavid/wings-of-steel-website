import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type {
  GoalieSeasonTotals,
  HeadToHeadRecord,
  PlayerCareerTotals,
  PlayerSeasonTotals,
  Season,
  TeamSeasonRecord,
} from '../types/stats';

/**
 * Stats hooks, reading the season-aware views from migration 016.
 *
 * Everything here is season-scoped by default. The previous implementation
 * queried player_game_stats by player_id with no season or date filter and
 * labelled the result "Season Stats" — it was career totals. Season isolation
 * was in practice enforced by the bulk importer DELETING the prior season's
 * rows before importing, which is why it looked right.
 */

interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

function useSupabaseQuery<T>(
  run: () => PromiseLike<{ data: T | null; error: { message: string } | null }>,
  deps: unknown[],
  empty: T
): AsyncState<T> & { refetch: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    data: empty,
    loading: true,
    error: null,
  });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));

    Promise.resolve(run()).then(
      ({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setState({ data: empty, loading: false, error: error.message });
        } else {
          setState({ data: data ?? empty, loading: false, error: null });
        }
      },
      (err: unknown) => {
        if (cancelled) return;
        setState({
          data: empty,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load stats',
        });
      }
    );

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, refetch };
}

/* ------------------------------------------------------------------ seasons */

const NO_SEASONS: Season[] = [];

export function useSeasons() {
  const { data, loading, error } = useSupabaseQuery<Season[]>(
    () =>
      supabase
        .from('seasons')
        .select('id, label, start_date, end_date, is_current')
        .order('start_date', { ascending: false }),
    [],
    NO_SEASONS
  );

  // Which seasons actually have played games. Needed to choose a sensible
  // default — see below.
  const { data: records, loading: recordsLoading } = useSupabaseQuery<
    Pick<TeamSeasonRecord, 'season_id' | 'games_played'>[]
  >(
    () => supabase.from('team_season_record').select('season_id, games_played'),
    [],
    [] as Pick<TeamSeasonRecord, 'season_id' | 'games_played'>[]
  );

  const currentSeason = useMemo(
    () => data.find((s) => s.is_current) ?? data[0] ?? null,
    [data]
  );

  /**
   * The season a visitor most likely wants to see.
   *
   * NOT simply `is_current`. `is_current` marks the season we are IN, which in
   * August contains zero played games — landing on an empty leaderboard is a
   * worse answer than showing the season that just finished. So: the current
   * season if it has games, otherwise the most recent season that does.
   *
   * Stays NULL until BOTH queries have resolved. Consumers commit the default
   * to state the first time it is non-null, so returning an early guess based
   * on a half-loaded picture would lock in the wrong season permanently — which
   * is exactly what happened on the first deploy: seasons resolved first, the
   * "which seasons have games" set was still empty, so it fell through to
   * `is_current` (2026-27, zero games) and never corrected itself.
   */
  const defaultSeason = useMemo(() => {
    if (loading || recordsLoading) return null;
    if (!data.length) return null;
    const played = new Set(
      records.filter((r) => r.games_played > 0).map((r) => r.season_id)
    );
    if (currentSeason && played.has(currentSeason.id)) return currentSeason;
    return data.find((s) => played.has(s.id)) ?? currentSeason ?? data[0];
  }, [data, records, currentSeason, loading, recordsLoading]);

  return {
    seasons: data,
    currentSeason,
    defaultSeason,
    loading: loading || recordsLoading,
    error,
  };
}

/* -------------------------------------------------------- player leaderboard */

const NO_PLAYER_TOTALS: PlayerSeasonTotals[] = [];

export function usePlayerSeasonTotals(seasonId: string | null | undefined) {
  const { data, loading, error } = useSupabaseQuery<PlayerSeasonTotals[]>(
    () => {
      const q = supabase.from('player_season_totals').select('*');
      return (seasonId ? q.eq('season_id', seasonId) : q).order('points', {
        ascending: false,
      });
    },
    [seasonId],
    NO_PLAYER_TOTALS
  );

  const skaters = useMemo(() => data.filter((p) => !p.is_goalie), [data]);

  return { players: data, skaters, loading, error };
}

export function usePlayerCareerTotals(playerId?: string) {
  const { data, loading, error } = useSupabaseQuery<PlayerCareerTotals[]>(
    () => {
      const q = supabase.from('player_career_totals').select('*');
      return (playerId ? q.eq('player_id', playerId) : q).order('points', {
        ascending: false,
      });
    },
    [playerId],
    [] as PlayerCareerTotals[]
  );
  return { careers: data, career: data[0] ?? null, loading, error };
}

/**
 * Both views for one player, so a player card can offer an honest
 * "This Season / Career" toggle instead of labelling career totals as a season.
 */
export function usePlayerStats(playerId: string | undefined, seasonId: string | null | undefined) {
  const season = useSupabaseQuery<PlayerSeasonTotals[]>(
    () => {
      const q = supabase.from('player_season_totals').select('*');
      const scoped = playerId ? q.eq('player_id', playerId) : q;
      return seasonId ? scoped.eq('season_id', seasonId) : scoped;
    },
    [playerId, seasonId],
    NO_PLAYER_TOTALS
  );
  const career = usePlayerCareerTotals(playerId);

  return {
    season: season.data[0] ?? null,
    career: career.career,
    loading: season.loading || career.loading,
    error: season.error ?? career.error,
  };
}

/* ------------------------------------------------------------------ goalies */

export function useGoalieSeasonTotals(seasonId: string | null | undefined) {
  const { data, loading, error } = useSupabaseQuery<GoalieSeasonTotals[]>(
    () => {
      const q = supabase.from('goalie_season_totals').select('*');
      return (seasonId ? q.eq('season_id', seasonId) : q).order('games_played', {
        ascending: false,
      });
    },
    [seasonId],
    [] as GoalieSeasonTotals[]
  );
  return { goalies: data, loading, error };
}

/* -------------------------------------------------------------- team record */

export function useTeamSeasonRecord(seasonId: string | null | undefined) {
  const { data, loading, error } = useSupabaseQuery<TeamSeasonRecord[]>(
    () => {
      const q = supabase.from('team_season_record').select('*');
      return seasonId ? q.eq('season_id', seasonId) : q;
    },
    [seasonId],
    [] as TeamSeasonRecord[]
  );
  return { record: data[0] ?? null, records: data, loading, error };
}

/* ------------------------------------------------------------- head to head */

export function useHeadToHead(seasonId: string | null | undefined) {
  const { data, loading, error } = useSupabaseQuery<HeadToHeadRecord[]>(
    () => {
      const q = supabase.from('head_to_head_records').select('*');
      return (seasonId ? q.eq('season_id', seasonId) : q).order('games_played', {
        ascending: false,
      });
    },
    [seasonId],
    [] as HeadToHeadRecord[]
  );
  return { opponents: data, loading, error };
}
