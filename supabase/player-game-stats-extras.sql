-- Add extra stat columns to player_game_stats + game_highlights.
-- Safe / additive: ALTER TABLE ADD COLUMN IF NOT EXISTS only.
-- Run once in Supabase SQL editor (after player-game-stats-setup.sql).

ALTER TABLE player_game_stats
  ADD COLUMN IF NOT EXISTS penalty_minutes INTEGER NOT NULL DEFAULT 0 CHECK (penalty_minutes >= 0),
  ADD COLUMN IF NOT EXISTS saves INTEGER NOT NULL DEFAULT 0 CHECK (saves >= 0),
  ADD COLUMN IF NOT EXISTS shots_on_goal INTEGER NOT NULL DEFAULT 0 CHECK (shots_on_goal >= 0);

-- Team-level stats per game (single row per highlight, not per-player).
ALTER TABLE game_highlights
  ADD COLUMN IF NOT EXISTS team_shots_for INTEGER CHECK (team_shots_for IS NULL OR team_shots_for >= 0),
  ADD COLUMN IF NOT EXISTS team_shots_against INTEGER CHECK (team_shots_against IS NULL OR team_shots_against >= 0);

-- Refresh the season totals view to include new aggregates.
DROP VIEW IF EXISTS player_season_totals;
CREATE VIEW player_season_totals AS
SELECT
  p.id AS player_id,
  p.first_name,
  p.last_name,
  p.jersey_number,
  COALESCE(SUM(s.goals), 0)::int AS goals,
  COALESCE(SUM(s.assists), 0)::int AS assists,
  COALESCE(SUM(s.goals + s.assists), 0)::int AS points,
  COALESCE(SUM(s.penalty_minutes), 0)::int AS penalty_minutes,
  COALESCE(SUM(s.saves), 0)::int AS saves,
  COALESCE(SUM(s.shots_on_goal), 0)::int AS shots_on_goal,
  COUNT(s.id) AS games_with_stats
FROM players p
LEFT JOIN player_game_stats s ON s.player_id = p.id
GROUP BY p.id, p.first_name, p.last_name, p.jersey_number;

GRANT SELECT ON player_season_totals TO anon, authenticated;
