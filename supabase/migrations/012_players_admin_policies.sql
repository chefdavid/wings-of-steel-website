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
