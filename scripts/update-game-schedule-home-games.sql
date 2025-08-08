-- Update Game Schedule with Home Games for 2025-2026 Season
-- First, check if the game_schedules table exists, if not create it

-- Step 1: Create the game_schedules table if it doesn't exist
CREATE TABLE IF NOT EXISTS game_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_date DATE NOT NULL,
  game_time TIME NOT NULL,
  end_time TIME,
  opponent VARCHAR(255) DEFAULT 'TBD',
  location VARCHAR(255) NOT NULL,
  home_away VARCHAR(10) CHECK (home_away IN ('home', 'away')),
  game_type VARCHAR(50), -- 'regular', 'playoff', 'tournament', 'scrimmage'
  result VARCHAR(50), -- 'W 5-3', 'L 2-4', 'T 3-3', null for future games
  notes TEXT,
  season VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_game_schedules_date ON game_schedules(game_date);
CREATE INDEX IF NOT EXISTS idx_game_schedules_home_away ON game_schedules(home_away);
CREATE INDEX IF NOT EXISTS idx_game_schedules_season ON game_schedules(season);

-- Step 3: Disable RLS for easier management
ALTER TABLE game_schedules DISABLE ROW LEVEL SECURITY;

-- Step 4: Clear any existing demo/test data
DELETE FROM game_schedules;

-- Step 5: Insert home games for 2025-2026 season
INSERT INTO game_schedules (
  game_date,
  game_time,
  end_time,
  opponent,
  location,
  home_away,
  game_type,
  notes,
  season,
  is_active
) VALUES 
-- Saturday Games
('2025-10-18', '13:20:00', '14:35:00', 'TBD', 'Flyers Skate Zone', 'home', 'regular', 'Weekend game', '2025-2026 Season', true),
('2025-11-29', '13:20:00', '14:35:00', 'TBD', 'Flyers Skate Zone', 'home', 'regular', 'Thanksgiving weekend', '2025-2026 Season', true),
('2026-02-21', '13:20:00', '14:35:00', 'TBD', 'Flyers Skate Zone', 'home', 'regular', 'Mid-season game', '2025-2026 Season', true),
('2026-02-28', '09:00:00', '10:15:00', 'TBD', 'Flyers Skate Zone', 'home', 'regular', 'Morning session - Double-header day (Game 1)', '2025-2026 Season', true),
('2026-02-28', '14:30:00', '15:45:00', 'TBD', 'Flyers Skate Zone', 'home', 'regular', 'Afternoon session - Double-header day (Game 2)', '2025-2026 Season', true),

-- Sunday Games
('2025-10-19', '13:20:00', '14:35:00', 'TBD', 'Flyers Skate Zone', 'home', 'regular', 'Weekend after Saturday game', '2025-2026 Season', true),
('2025-11-16', '13:20:00', '14:35:00', 'TBD', 'Flyers Skate Zone', 'home', 'regular', 'Mid-month game', '2025-2026 Season', true),
('2025-12-21', '13:20:00', '14:35:00', 'TBD', 'Flyers Skate Zone', 'home', 'regular', 'Before holiday break', '2025-2026 Season', true),
('2026-02-15', '13:20:00', '14:35:00', 'TBD', 'Flyers Skate Zone', 'home', 'regular', 'President''s Day weekend', '2025-2026 Season', true),
('2026-03-01', '13:20:00', '14:35:00', 'TBD', 'Flyers Skate Zone', 'home', 'regular', 'Start of March', '2025-2026 Season', true),
('2026-03-22', '13:20:00', '14:35:00', 'TBD', 'Flyers Skate Zone', 'home', 'regular', 'Late season game', '2025-2026 Season', true);

-- Step 6: Create or replace view for upcoming games
CREATE OR REPLACE VIEW upcoming_games AS
SELECT 
  *,
  TO_CHAR(game_time, 'HH12:MI AM') as game_time_formatted,
  TO_CHAR(end_time, 'HH12:MI AM') as end_time_formatted,
  TO_CHAR(game_date, 'Day, Mon DD, YYYY') as game_date_formatted,
  TO_CHAR(game_date, 'Dy, Mon DD') as game_date_short,
  CASE 
    WHEN game_date < CURRENT_DATE THEN 'past'
    WHEN game_date = CURRENT_DATE THEN 'today'
    ELSE 'future'
  END as game_status
FROM game_schedules
WHERE is_active = true
ORDER BY game_date, game_time;

-- Step 7: Create view for next games (limit 5)
CREATE OR REPLACE VIEW next_games AS
SELECT * FROM upcoming_games
WHERE game_date >= CURRENT_DATE
ORDER BY game_date, game_time
LIMIT 5;

-- Step 8: Verify the data
SELECT COUNT(*) as total_games, 
       COUNT(CASE WHEN home_away = 'home' THEN 1 END) as home_games,
       COUNT(CASE WHEN home_away = 'away' THEN 1 END) as away_games
FROM game_schedules;

-- Display all games to verify
SELECT 
  game_date_formatted as "Date",
  game_time_formatted || ' - ' || end_time_formatted as "Time",
  opponent as "Opponent",
  home_away as "Type",
  notes as "Notes"
FROM upcoming_games
ORDER BY game_date, game_time;