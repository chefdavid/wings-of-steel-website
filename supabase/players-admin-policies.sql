-- Allow anon-key UPDATEs on players so the admin form can save edits.
-- Matches the open-access pattern already used by game_highlights,
-- practice_schedules, golf_registrations etc. The admin UI in this project
-- uses the anon key with no auth gating; without this policy, RLS silently
-- rejects the UPDATE, returning 0 rows changed and looking like the form
-- "didn't save".
-- Safe / idempotent: each policy is created only if it isn't already there.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='players' AND policyname='Public update players') THEN
    CREATE POLICY "Public update players" ON players FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='players' AND policyname='Public insert players') THEN
    CREATE POLICY "Public insert players" ON players FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='players' AND policyname='Public delete players') THEN
    CREATE POLICY "Public delete players" ON players FOR DELETE USING (true);
  END IF;
END $$;
