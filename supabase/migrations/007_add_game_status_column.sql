-- Add status column to game_schedules table
ALTER TABLE game_schedules ADD COLUMN IF NOT EXISTS status text DEFAULT 'Scheduled';

-- Mark today's game (2026-03-01 vs DC Sled Sharks) as Cancelled
UPDATE game_schedules
SET status = 'Cancelled', updated_at = now()
WHERE game_date = '2026-03-01' AND opponent = 'DC Sled Sharks';
