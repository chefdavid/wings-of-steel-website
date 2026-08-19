-- The Wings Press: standalone stories/features not tied to the game schedule.
-- Use cases: nationals championship recap, player spotlights, community moments.
-- Mirrors the RLS shape used for game_highlights so the existing admin
-- (custom password gate, anon supabase key) can read/write without auth.uid().

CREATE TABLE IF NOT EXISTS press_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  body TEXT NOT NULL DEFAULT '',
  cover_photo_url TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  author TEXT,
  published_at DATE,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE OR REPLACE FUNCTION update_press_stories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_press_stories_timestamp ON press_stories;
CREATE TRIGGER update_press_stories_timestamp
  BEFORE UPDATE ON press_stories
  FOR EACH ROW
  EXECUTE FUNCTION update_press_stories_updated_at();

CREATE INDEX IF NOT EXISTS idx_press_stories_published ON press_stories(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_press_stories_featured ON press_stories(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_press_stories_slug ON press_stories(slug);

ALTER TABLE press_stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published stories" ON press_stories;
DROP POLICY IF EXISTS "Anon can read all stories" ON press_stories;
DROP POLICY IF EXISTS "Anon can insert stories" ON press_stories;
DROP POLICY IF EXISTS "Anon can update stories" ON press_stories;
DROP POLICY IF EXISTS "Anon can delete stories" ON press_stories;

-- Public site reads published stories. Admin (anon key + password gate) needs
-- full read so it can list drafts too — same shape as the players table after
-- the recent open-RLS fix for anon writes.
CREATE POLICY "Anon can read all stories" ON press_stories
  FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert stories" ON press_stories
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update stories" ON press_stories
  FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete stories" ON press_stories
  FOR DELETE TO anon USING (true);

GRANT ALL ON press_stories TO anon;
GRANT ALL ON press_stories TO authenticated;
