-- Game Highlights Table
-- This table stores game summaries, photos, and highlights for each game

CREATE TABLE IF NOT EXISTS game_highlights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES game_schedules(id) ON DELETE CASCADE,

  -- Game Summary
  title TEXT,
  summary TEXT,
  final_score TEXT,

  -- Highlight Details
  key_moments JSONB DEFAULT '[]'::JSONB, -- Array of {time: string, description: string}
  player_highlights JSONB DEFAULT '[]'::JSONB, -- Array of {player_name: string, achievement: string}

  -- Media
  photos JSONB DEFAULT '[]'::JSONB, -- Array of {url: string, caption: string, order: number}
  video_url TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by TEXT,
  is_published BOOLEAN DEFAULT false
);

-- Create index on game_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_game_highlights_game_id ON game_highlights(game_id);

-- Create index on is_published for filtering
CREATE INDEX IF NOT EXISTS idx_game_highlights_published ON game_highlights(is_published);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_game_highlights_updated_at ON game_highlights;
CREATE TRIGGER update_game_highlights_updated_at
    BEFORE UPDATE ON game_highlights
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE game_highlights ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view published highlights
CREATE POLICY "Public can view published game highlights"
  ON game_highlights FOR SELECT
  USING (is_published = true);

-- Policy: Authenticated users can view all highlights (for admin)
CREATE POLICY "Authenticated users can view all game highlights"
  ON game_highlights FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can insert highlights
CREATE POLICY "Authenticated users can insert game highlights"
  ON game_highlights FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update highlights
CREATE POLICY "Authenticated users can update game highlights"
  ON game_highlights FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: Authenticated users can delete highlights
CREATE POLICY "Authenticated users can delete game highlights"
  ON game_highlights FOR DELETE
  TO authenticated
  USING (true);

-- Create storage bucket for game photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('game-photos', 'game-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for game photos
CREATE POLICY "Public can view game photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'game-photos');

CREATE POLICY "Authenticated users can upload game photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'game-photos');

CREATE POLICY "Authenticated users can update game photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'game-photos');

CREATE POLICY "Authenticated users can delete game photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'game-photos');

-- Add comment to table
COMMENT ON TABLE game_highlights IS 'Stores game highlights, summaries, and photos for each game';
