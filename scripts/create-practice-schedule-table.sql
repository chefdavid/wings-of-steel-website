-- Create practice_schedules table
CREATE TABLE IF NOT EXISTS practice_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week VARCHAR(20) NOT NULL, -- 'Monday', 'Tuesday', etc.
  day_order INTEGER NOT NULL, -- 1 for Monday, 2 for Tuesday, etc. for sorting
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  team_type VARCHAR(50), -- 'youth', 'adult', 'all', 'mites', 'squirts', etc.
  location VARCHAR(255) DEFAULT 'Flyers Skate Zone',
  rink VARCHAR(100), -- 'Main Rink', 'Practice Rink', etc.
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  season VARCHAR(50), -- 'Fall 2024', 'Spring 2025', etc.
  effective_from DATE,
  effective_to DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_practice_schedules_day ON practice_schedules(day_of_week);
CREATE INDEX idx_practice_schedules_active ON practice_schedules(is_active);
CREATE INDEX idx_practice_schedules_team ON practice_schedules(team_type);
CREATE INDEX idx_practice_schedules_dates ON practice_schedules(effective_from, effective_to);

-- Disable RLS for easier management (can be enabled later with proper policies)
ALTER TABLE practice_schedules DISABLE ROW LEVEL SECURITY;

-- Insert default practice schedule data
INSERT INTO practice_schedules (
  day_of_week,
  day_order,
  start_time,
  end_time,
  team_type,
  location,
  rink,
  description,
  is_active,
  season
) VALUES 
-- Monday
('Monday', 1, '17:30:00', '18:30:00', 'youth', 'Flyers Skate Zone', 'Main Rink', 'Youth Team Practice - Skills Development', true, 'Spring 2025'),
('Monday', 1, '18:30:00', '19:30:00', 'youth', 'Flyers Skate Zone', 'Main Rink', 'Youth Team Practice - Game Strategies', true, 'Spring 2025'),

-- Tuesday
('Tuesday', 2, '18:00:00', '19:00:00', 'mites', 'Flyers Skate Zone', 'Practice Rink', 'Mites Division Practice', true, 'Spring 2025'),
('Tuesday', 2, '19:00:00', '20:00:00', 'squirts', 'Flyers Skate Zone', 'Main Rink', 'Squirts Division Practice', true, 'Spring 2025'),

-- Wednesday
('Wednesday', 3, '17:30:00', '18:30:00', 'youth', 'Flyers Skate Zone', 'Main Rink', 'Youth Team Practice - Power Play/Penalty Kill', true, 'Spring 2025'),
('Wednesday', 3, '18:30:00', '19:30:00', 'youth', 'Flyers Skate Zone', 'Main Rink', 'Youth Team Practice - Scrimmage', true, 'Spring 2025'),

-- Thursday
('Thursday', 4, '18:00:00', '19:00:00', 'bantams', 'Flyers Skate Zone', 'Main Rink', 'Bantams Division Practice', true, 'Spring 2025'),
('Thursday', 4, '19:00:00', '20:00:00', 'juniors', 'Flyers Skate Zone', 'Main Rink', 'Juniors Division Practice', true, 'Spring 2025'),

-- Friday
('Friday', 5, '17:00:00', '18:00:00', 'all', 'Flyers Skate Zone', 'Main Rink', 'Optional Skills Clinic - All Divisions', true, 'Spring 2025'),
('Friday', 5, '18:00:00', '19:30:00', 'youth', 'Flyers Skate Zone', 'Main Rink', 'Youth Team Practice - Pre-Game Preparation', true, 'Spring 2025'),

-- Saturday
('Saturday', 6, '08:00:00', '09:30:00', 'youth', 'Flyers Skate Zone', 'Main Rink', 'Saturday Morning Practice - Full Team', true, 'Spring 2025'),
('Saturday', 6, '09:30:00', '10:30:00', 'beginners', 'Flyers Skate Zone', 'Practice Rink', 'Learn to Play Sled Hockey', true, 'Spring 2025'),

-- Sunday
('Sunday', 7, '09:00:00', '10:00:00', 'mites', 'Flyers Skate Zone', 'Practice Rink', 'Mites Sunday Skills', true, 'Spring 2025'),
('Sunday', 7, '10:00:00', '11:30:00', 'youth', 'Flyers Skate Zone', 'Main Rink', 'Youth Team Practice - Game Day', true, 'Spring 2025'),
('Sunday', 7, '11:30:00', '12:30:00', 'all', 'Flyers Skate Zone', 'Main Rink', 'Open Practice - All Welcome', true, 'Spring 2025');

-- Create a view for easy querying of current schedule
CREATE OR REPLACE VIEW current_practice_schedule AS
SELECT 
  *,
  TO_CHAR(start_time, 'HH12:MI AM') as start_time_formatted,
  TO_CHAR(end_time, 'HH12:MI AM') as end_time_formatted,
  EXTRACT(HOUR FROM end_time - start_time) || 'h ' || 
  EXTRACT(MINUTE FROM end_time - start_time) || 'm' as duration
FROM practice_schedules
WHERE is_active = true
  AND (effective_from IS NULL OR effective_from <= CURRENT_DATE)
  AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
ORDER BY day_order, start_time;