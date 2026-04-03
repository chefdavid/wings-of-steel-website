-- Tournament and Featured Highlights Migration
-- Run this in Supabase SQL Editor
-- This is non-destructive: all new columns are nullable, existing data is unaffected.

-- 1. Create tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  location TEXT,
  description TEXT,
  season TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_tournaments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tournaments_timestamp
  BEFORE UPDATE ON tournaments
  FOR EACH ROW
  EXECUTE FUNCTION update_tournaments_updated_at();

-- RLS for tournaments
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Auth can insert tournaments" ON tournaments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update tournaments" ON tournaments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth can delete tournaments" ON tournaments FOR DELETE TO authenticated USING (true);

-- 2. Alter game_highlights: make game_id nullable for standalone games
ALTER TABLE game_highlights ALTER COLUMN game_id DROP NOT NULL;

-- Drop existing FK constraint if it exists (name may vary)
DO $$
BEGIN
  ALTER TABLE game_highlights DROP CONSTRAINT IF EXISTS game_highlights_game_id_fkey;
  ALTER TABLE game_highlights DROP CONSTRAINT IF EXISTS fk_game_highlights_game_id;
EXCEPTION WHEN OTHERS THEN
  -- Ignore if constraint doesn't exist
  NULL;
END $$;

-- 3. Add tournament reference
ALTER TABLE game_highlights ADD COLUMN IF NOT EXISTS tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL;

-- 4. Add featured flag
ALTER TABLE game_highlights ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 5. Add standalone game metadata (used when game_id is NULL)
ALTER TABLE game_highlights ADD COLUMN IF NOT EXISTS opponent TEXT;
ALTER TABLE game_highlights ADD COLUMN IF NOT EXISTS game_date DATE;
ALTER TABLE game_highlights ADD COLUMN IF NOT EXISTS game_time TEXT;
ALTER TABLE game_highlights ADD COLUMN IF NOT EXISTS game_location TEXT;
ALTER TABLE game_highlights ADD COLUMN IF NOT EXISTS home_away TEXT;
ALTER TABLE game_highlights ADD COLUMN IF NOT EXISTS game_type TEXT; -- 'tournament', 'exhibition', 'scrimmage', 'regular'

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_game_highlights_tournament ON game_highlights(tournament_id);
CREATE INDEX IF NOT EXISTS idx_game_highlights_featured ON game_highlights(is_featured);
CREATE INDEX IF NOT EXISTS idx_game_highlights_game_date ON game_highlights(game_date);
CREATE INDEX IF NOT EXISTS idx_game_highlights_game_type ON game_highlights(game_type);

-- 7. Grant permissions
GRANT SELECT ON tournaments TO PUBLIC;
GRANT ALL ON tournaments TO authenticated;
