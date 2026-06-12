-- Allow anon-key writes on players so the admin form can save edits directly.
-- The admin UI uses the anon key with no Supabase auth session. Without these
-- policies, UPDATE/INSERT/DELETE silently return 0 rows changed.
-- Mirrors the open-access pattern used by press_stories, game_highlights, etc.

DROP POLICY IF EXISTS "Public update players" ON players;
DROP POLICY IF EXISTS "Public insert players" ON players;
DROP POLICY IF EXISTS "Public delete players" ON players;

CREATE POLICY "Public update players" ON players
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public insert players" ON players
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Public delete players" ON players
  FOR DELETE TO anon, authenticated USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON players TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON players TO authenticated;

-- player_teams junction table: same anon-write pattern for admin team assignments.
ALTER TABLE player_teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read player_teams" ON player_teams;
DROP POLICY IF EXISTS "Public insert player_teams" ON player_teams;
DROP POLICY IF EXISTS "Public update player_teams" ON player_teams;
DROP POLICY IF EXISTS "Public delete player_teams" ON player_teams;

CREATE POLICY "Public read player_teams" ON player_teams
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public insert player_teams" ON player_teams
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Public update player_teams" ON player_teams
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public delete player_teams" ON player_teams
  FOR DELETE TO anon, authenticated USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON player_teams TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON player_teams TO authenticated;
