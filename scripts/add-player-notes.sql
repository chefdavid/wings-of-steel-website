-- Add Player Notes Field
-- Run this SQL command in your Supabase SQL Editor

-- Add player_notes column for disabilities, special needs, coaching notes, etc.
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS player_notes TEXT;

-- Add comments to explain the field
COMMENT ON COLUMN players.player_notes IS 'Player notes including disabilities, special needs, coaching notes, accommodations, etc.';

-- Verify the new column was added
SELECT 
  name, 
  jersey_number, 
  position, 
  player_notes
FROM players 
LIMIT 3;

-- Show table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'players' 
ORDER BY ordinal_position;