/**
 * Types for the season-aware stats views added in migrations 015–016.
 *
 * These mirror the SQL views exactly. If you change a view, change this file.
 * Stats components previously used `useState<any[]>` and reduced raw rows
 * inline, which is how "Season Stats" ended up showing career totals for a
 * year without anyone noticing.
 */

export interface Season {
  id: string;
  label: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
}

/** public.player_season_totals */
export interface PlayerSeasonTotals {
  player_id: string;
  first_name: string | null;
  last_name: string | null;
  jersey_number: number | null;
  position: string | null;
  is_goalie: boolean;
  season_id: string | null;
  season_label: string | null;
  is_current_season: boolean | null;
  games_played: number;
  goals: number;
  assists: number;
  points: number;
  penalty_minutes: number;
  shots_on_goal: number;
  saves: number;
  /** null for skaters — distinct from 0, which is a shutout */
  goals_against: number | null;
  shots_faced: number | null;
  minutes_played: number | null;
}

/** public.player_career_totals */
export interface PlayerCareerTotals {
  player_id: string;
  first_name: string | null;
  last_name: string | null;
  jersey_number: number | null;
  is_goalie: boolean;
  games_played: number;
  seasons_played: number;
  goals: number;
  assists: number;
  points: number;
  penalty_minutes: number;
  shots_on_goal: number;
  saves: number;
}

/** public.goalie_season_totals */
export interface GoalieSeasonTotals {
  player_id: string;
  first_name: string | null;
  last_name: string | null;
  jersey_number: number | null;
  season_id: string | null;
  season_label: string | null;
  games_played: number;
  saves: number;
  goals_against: number;
  shots_faced: number;
  minutes_played: number;
  /** null when no shots have been recorded — do not render as 0.000 */
  save_pct: number | null;
  gaa: number | null;
  shutouts: number;
}

/** public.team_season_record */
export interface TeamSeasonRecord {
  season_id: string | null;
  season_label: string | null;
  is_current_season: boolean | null;
  games_played: number;
  wins: number;
  losses: number;
  ties: number;
  upcoming: number;
  goals_for: number;
  goals_against: number;
  home_wins: number;
  away_wins: number;
  shutouts_for: number;
}

/** public.head_to_head_records */
export interface HeadToHeadRecord {
  opponent: string;
  season_id: string | null;
  season_label: string | null;
  games_played: number;
  wins: number;
  losses: number;
  ties: number;
  goals_for: number;
  goals_against: number;
  last_played: string | null;
}

/** A single box-score line. public.player_game_stats */
export interface PlayerGameStat {
  id: string;
  player_id: string;
  game_id: string | null;
  game_highlight_id: string | null;
  season_id: string | null;
  dressed: boolean;
  goals: number;
  assists: number;
  penalty_minutes: number;
  shots_on_goal: number;
  saves: number;
  goals_against: number | null;
  shots_faced: number | null;
  minutes_played: number | null;
  notes: string | null;
}

export const fullName = (p: { first_name: string | null; last_name: string | null }): string =>
  [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || 'Unknown player';

/** Format a save percentage as .912 — returns an em dash when unrecorded. */
export const formatSavePct = (pct: number | null | undefined): string =>
  pct == null ? '—' : pct.toFixed(3).replace(/^0/, '');

export const formatGaa = (gaa: number | null | undefined): string =>
  gaa == null ? '—' : gaa.toFixed(2);

/** "20-1-0", or "20-1" when there are no ties to report. */
export const formatRecord = (r: Pick<TeamSeasonRecord, 'wins' | 'losses' | 'ties'>): string =>
  r.ties > 0 ? `${r.wins}-${r.losses}-${r.ties}` : `${r.wins}-${r.losses}`;
