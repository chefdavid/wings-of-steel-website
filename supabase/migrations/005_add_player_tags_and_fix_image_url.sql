-- Add tags array field to players table and fix image_url to allow nulls
ALTER TABLE players 
ADD COLUMN tags TEXT[] DEFAULT '{}',
ALTER COLUMN image_url DROP NOT NULL;

-- Add index for tags field for better performance
CREATE INDEX idx_players_tags ON players USING GIN (tags);