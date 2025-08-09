-- Wings of Steel 2025-26 Season Schedule Update
-- Based on official booking report

-- First, clear existing practice and game schedules for the 2025-26 season
DELETE FROM practice_schedules WHERE 
  season IN ('Fall 2025', 'Spring 2026', 'Holiday Break') 
  OR (effective_from >= '2025-09-01' AND effective_from <= '2026-05-01');
DELETE FROM game_schedule WHERE date >= '2025-09-01' AND date <= '2026-05-01';

-- ==========================================
-- PRACTICE SCHEDULES
-- ==========================================

-- September 2025 Practices (Flyers Ice Rink - Early Season)
INSERT INTO practice_schedules (
  day_of_week, day_order, start_time, end_time, team_type, 
  location, rink, description, is_active, season, 
  effective_from, effective_to, notes
) VALUES
-- Thursday Sep 4
('Thursday', 5, '16:30:00', '17:30:00', 'youth', 
 'Flyers Skate Zone', 'Flyers Ice Rink', 'Early Season Practice', 
 true, 'Fall 2025', '2025-09-04', '2025-09-04', NULL),

-- Thursday Sep 18
('Thursday', 5, '16:30:00', '17:30:00', 'youth', 
 'Flyers Skate Zone', 'Flyers Ice Rink', 'Early Season Practice', 
 true, 'Fall 2025', '2025-09-18', '2025-09-18', NULL),

-- Thursday Sep 25
('Thursday', 5, '16:00:00', '17:00:00', 'youth', 
 'Flyers Skate Zone', 'Flyers Ice Rink', 'Early Season Practice', 
 true, 'Fall 2025', '2025-09-25', '2025-09-25', NULL);

-- October 2025 - December 2025 Practices (Rink #3 - Regular Season)
INSERT INTO practice_schedules (
  day_of_week, day_order, start_time, end_time, team_type, 
  location, rink, description, is_active, season, 
  effective_from, effective_to, notes
) VALUES
-- October
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'Regular Season Practice', 
 true, 'Fall 2025', '2025-10-02', '2025-10-02', NULL),
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'Regular Season Practice', 
 true, 'Fall 2025', '2025-10-09', '2025-10-09', NULL),
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'Regular Season Practice', 
 true, 'Fall 2025', '2025-10-23', '2025-10-23', NULL),
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'Regular Season Practice', 
 true, 'Fall 2025', '2025-10-30', '2025-10-30', NULL),

-- November
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'Regular Season Practice', 
 true, 'Fall 2025', '2025-11-06', '2025-11-06', NULL),
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'Regular Season Practice', 
 true, 'Fall 2025', '2025-11-13', '2025-11-13', NULL),
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'Regular Season Practice', 
 true, 'Fall 2025', '2025-11-20', '2025-11-20', NULL),

-- December (before holiday break)
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'Regular Season Practice', 
 true, 'Fall 2025', '2025-12-04', '2025-12-04', NULL),
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'Regular Season Practice', 
 true, 'Fall 2025', '2025-12-11', '2025-12-11', NULL),
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'Last Practice Before Holiday Break', 
 true, 'Fall 2025', '2025-12-18', '2025-12-18', 'Last practice before holiday break');

-- January 2026 - March 2026 Practices (Spring Season)
INSERT INTO practice_schedules (
  day_of_week, day_order, start_time, end_time, team_type, 
  location, rink, description, is_active, season, 
  effective_from, effective_to, notes
) VALUES
-- January (after holiday break)
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'First Practice After Holiday Break', 
 true, 'Spring 2026', '2026-01-08', '2026-01-08', 'First practice after holiday break'),
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'Regular Season Practice', 
 true, 'Spring 2026', '2026-01-15', '2026-01-15', NULL),
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'Regular Season Practice', 
 true, 'Spring 2026', '2026-01-22', '2026-01-22', NULL),
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'Regular Season Practice', 
 true, 'Spring 2026', '2026-01-29', '2026-01-29', NULL),

-- February
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'Regular Season Practice', 
 true, 'Spring 2026', '2026-02-05', '2026-02-05', NULL),
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'Regular Season Practice', 
 true, 'Spring 2026', '2026-02-12', '2026-02-12', NULL),
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'Regular Season Practice', 
 true, 'Spring 2026', '2026-02-19', '2026-02-19', NULL),

-- End of February
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'Regular Season Practice', 
 true, 'Spring 2026', '2026-02-26', '2026-02-26', NULL),

-- March
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'Regular Season Practice', 
 true, 'Spring 2026', '2026-03-05', '2026-03-05', NULL),
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'Regular Season Practice', 
 true, 'Spring 2026', '2026-03-12', '2026-03-12', NULL),
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'Regular Season Practice', 
 true, 'Spring 2026', '2026-03-19', '2026-03-19', NULL),
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'Regular Season Practice', 
 true, 'Spring 2026', '2026-03-26', '2026-03-26', NULL),

-- April
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'Regular Season Practice', 
 true, 'Spring 2026', '2026-04-02', '2026-04-02', NULL),
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'Regular Season Practice', 
 true, 'Spring 2026', '2026-04-09', '2026-04-09', NULL),
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'Regular Season Practice', 
 true, 'Spring 2026', '2026-04-16', '2026-04-16', NULL),
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'Regular Season Practice', 
 true, 'Spring 2026', '2026-04-23', '2026-04-23', NULL),
('Thursday', 5, '18:10:00', '19:10:00', 'youth', 
 'Flyers Skate Zone', 'Rink #3', 'End of Season Practice', 
 true, 'Spring 2026', '2026-04-30', '2026-04-30', 'End of season practice');

-- ==========================================
-- GAME SCHEDULES
-- ==========================================

-- Games are the weekend dates (Saturdays and Sundays at Flyers Ice Rink)
INSERT INTO game_schedule (
  date, opponent, location, home_game, notes, status
) VALUES
-- October Games
('2025-10-18 13:20:00', 'TBD', 'Flyers Skate Zone, Voorhees NJ', true, 'Season Opener', 'Scheduled'),
('2025-10-19 13:20:00', 'TBD', 'Flyers Skate Zone, Voorhees NJ', true, NULL, 'Scheduled'),

-- November Games
('2025-11-16 13:20:00', 'TBD', 'Flyers Skate Zone, Voorhees NJ', true, NULL, 'Scheduled'),
('2025-11-29 13:20:00', 'TBD', 'Flyers Skate Zone, Voorhees NJ', true, 'Thanksgiving Weekend', 'Scheduled'),

-- December Games
('2025-12-21 13:20:00', 'TBD', 'Flyers Skate Zone, Voorhees NJ', true, 'Last Game Before Holiday Break', 'Scheduled'),

-- February Games
('2026-02-15 13:20:00', 'TBD', 'Flyers Skate Zone, Voorhees NJ', true, NULL, 'Scheduled'),
('2026-02-21 13:20:00', 'TBD', 'Flyers Skate Zone, Voorhees NJ', true, NULL, 'Scheduled'),

-- February 28 - Tournament Day (Multiple Games)
('2026-02-28 09:00:00', 'TBD', 'Flyers Skate Zone, Voorhees NJ', true, 'Tournament - Game 1', 'Scheduled'),
('2026-02-28 14:30:00', 'TBD', 'Flyers Skate Zone, Voorhees NJ', true, 'Tournament - Game 2', 'Scheduled'),

-- March Games
('2026-03-01 13:20:00', 'TBD', 'Flyers Skate Zone, Voorhees NJ', true, 'Tournament Finals', 'Scheduled'),
('2026-03-22 13:20:00', 'TBD', 'Flyers Skate Zone, Voorhees NJ', true, 'End of Season Game', 'Scheduled');

-- Add a note about the holiday break
INSERT INTO practice_schedules (
  day_of_week, day_order, start_time, end_time, team_type, 
  location, rink, description, is_active, season, 
  effective_from, effective_to, notes
) VALUES
('Thursday', 5, '00:00:00', '00:00:00', 'all', 
 'N/A', 'N/A', 'HOLIDAY BREAK - NO PRACTICE', 
 false, 'Holiday Break', '2025-12-19', '2026-01-07', 
 '❄️ Holiday Break: No practice from Dec 19, 2025 - Jan 7, 2026');