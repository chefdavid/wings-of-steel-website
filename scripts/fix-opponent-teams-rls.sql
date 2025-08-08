-- Fix RLS policies for opponent_teams table

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON opponent_teams;
DROP POLICY IF EXISTS "Allow authenticated users to manage teams" ON opponent_teams;

-- Temporarily disable RLS to insert data if needed
ALTER TABLE opponent_teams DISABLE ROW LEVEL SECURITY;

-- Option 1: Keep RLS disabled (simplest for development)
-- The table will be accessible without restrictions
-- Comment out the following lines if you want to use Option 2

-- Option 2: Re-enable RLS with proper policies (uncomment if needed)
-- ALTER TABLE opponent_teams ENABLE ROW LEVEL SECURITY;

-- -- Allow anyone to read teams (public access)
-- CREATE POLICY "Enable read access for all users" ON opponent_teams
--   FOR SELECT
--   USING (true);

-- -- Allow all operations for authenticated users
-- CREATE POLICY "Enable all operations for authenticated users" ON opponent_teams
--   FOR ALL
--   USING (auth.role() = 'authenticated')
--   WITH CHECK (auth.role() = 'authenticated');

-- -- Allow insert/update/delete using service role or anon key
-- CREATE POLICY "Enable insert for anon users" ON opponent_teams
--   FOR INSERT
--   WITH CHECK (true);

-- CREATE POLICY "Enable update for anon users" ON opponent_teams
--   FOR UPDATE
--   USING (true)
--   WITH CHECK (true);

-- CREATE POLICY "Enable delete for anon users" ON opponent_teams
--   FOR DELETE
--   USING (true);

-- Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'opponent_teams'
ORDER BY ordinal_position;