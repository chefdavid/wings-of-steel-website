-- Update Player Positions
-- Run this SQL command in your Supabase SQL Editor

-- Update all Forward positions to Offense
UPDATE players 
SET position = 'Offense' 
WHERE position = 'Forward';

-- Verify the changes
SELECT 
  name, 
  jersey_number, 
  position, 
  active 
FROM players 
ORDER BY position, jersey_number;

-- Show position summary
SELECT 
  position,
  COUNT(*) as player_count,
  COUNT(CASE WHEN active = true THEN 1 END) as active_count,
  COUNT(CASE WHEN active = false THEN 1 END) as inactive_count
FROM players 
GROUP BY position 
ORDER BY position;