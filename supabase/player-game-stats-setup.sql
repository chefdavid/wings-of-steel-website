-- Per-game player stats for Wings of Steel.
-- Safe / additive: creates a new table + adds optional columns to existing
-- tables. No drops, no destructive operations.
-- Run once in Supabase SQL editor.

-- Optional gamesheetstats.com mapping so we can deep-link from the player
-- modal to the official USA Hockey stats page and (later) sync from their API.
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS gamesheet_player_id TEXT,
  ADD COLUMN IF NOT EXISTS gamesheet_season_id TEXT;

ALTER TABLE game_highlights
  ADD COLUMN IF NOT EXISTS gamesheet_game_id TEXT;

CREATE TABLE IF NOT EXISTS player_game_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  game_highlight_id UUID NOT NULL REFERENCES game_highlights(id) ON DELETE CASCADE,
  goals INTEGER NOT NULL DEFAULT 0 CHECK (goals >= 0),
  assists INTEGER NOT NULL DEFAULT 0 CHECK (assists >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT player_game_stats_unique UNIQUE (player_id, game_highlight_id)
);

CREATE INDEX IF NOT EXISTS idx_pgs_player ON player_game_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_pgs_highlight ON player_game_stats(game_highlight_id);

-- Auto-update updated_at on row modification.
-- Reuses the function defined in golf-outing-setup.sql; create it if missing.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_player_game_stats_updated_at ON player_game_stats;
CREATE TRIGGER update_player_game_stats_updated_at
  BEFORE UPDATE ON player_game_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS: matches the open-access pattern used by other public tables in this
-- project (game_highlights, players, golf_registrations). Stats are non-
-- sensitive sports data; admin UI uses the anon key with no auth gating.
ALTER TABLE player_game_stats ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='player_game_stats' AND policyname='Public read player_game_stats') THEN
    CREATE POLICY "Public read player_game_stats" ON player_game_stats FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='player_game_stats' AND policyname='Public insert player_game_stats') THEN
    CREATE POLICY "Public insert player_game_stats" ON player_game_stats FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='player_game_stats' AND policyname='Public update player_game_stats') THEN
    CREATE POLICY "Public update player_game_stats" ON player_game_stats FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='player_game_stats' AND policyname='Public delete player_game_stats') THEN
    CREATE POLICY "Public delete player_game_stats" ON player_game_stats FOR DELETE USING (true);
  END IF;
END $$;

-- View for season totals per player (used by Team page modal + player cards).
CREATE OR REPLACE VIEW player_season_totals AS
SELECT
  p.id AS player_id,
  p.first_name,
  p.last_name,
  p.jersey_number,
  COALESCE(SUM(s.goals), 0)::int AS goals,
  COALESCE(SUM(s.assists), 0)::int AS assists,
  COALESCE(SUM(s.goals + s.assists), 0)::int AS points,
  COUNT(s.id) AS games_with_stats
FROM players p
LEFT JOIN player_game_stats s ON s.player_id = p.id
GROUP BY p.id, p.first_name, p.last_name, p.jersey_number;

GRANT SELECT ON player_season_totals TO anon, authenticated;
