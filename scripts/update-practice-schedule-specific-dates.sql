-- Clear existing practice schedule data
DELETE FROM practice_schedules;

-- Insert specific practice dates for 2025-2026 season
-- September 2025 - Pre-Season
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
  season,
  effective_from,
  effective_to,
  notes
) VALUES 
-- Pre-Season September
('Thursday', 4, '16:30:00', '17:30:00', 'youth', 'Flyers Skate Zone', 'Flyers Ice Rink', 'Pre-Season Practice', true, 'Fall 2025', '2025-09-04', '2025-09-04', 'Thursday, September 4, 2025'),
('Thursday', 4, '16:30:00', '17:30:00', 'youth', 'Flyers Skate Zone', 'Flyers Ice Rink', 'Pre-Season Practice', true, 'Fall 2025', '2025-09-18', '2025-09-18', 'Thursday, September 18, 2025'),
('Thursday', 4, '16:00:00', '17:00:00', 'youth', 'Flyers Skate Zone', 'Flyers Ice Rink', 'Pre-Season Practice', true, 'Fall 2025', '2025-09-25', '2025-09-25', 'Thursday, September 25, 2025'),

-- Main Season October 2025
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice', true, '2025-2026 Season', '2025-10-02', '2025-10-02', 'Thursday, October 2, 2025'),
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice', true, '2025-2026 Season', '2025-10-09', '2025-10-09', 'Thursday, October 9, 2025'),
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice', true, '2025-2026 Season', '2025-10-23', '2025-10-23', 'Thursday, October 23, 2025'),
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice', true, '2025-2026 Season', '2025-10-30', '2025-10-30', 'Thursday, October 30, 2025'),

-- November 2025
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice', true, '2025-2026 Season', '2025-11-06', '2025-11-06', 'Thursday, November 6, 2025'),
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice', true, '2025-2026 Season', '2025-11-13', '2025-11-13', 'Thursday, November 13, 2025'),
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice', true, '2025-2026 Season', '2025-11-20', '2025-11-20', 'Thursday, November 20, 2025'),

-- December 2025 (before holiday break)
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice', true, '2025-2026 Season', '2025-12-04', '2025-12-04', 'Thursday, December 4, 2025'),
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice', true, '2025-2026 Season', '2025-12-11', '2025-12-11', 'Thursday, December 11, 2025'),
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice - Last before Holiday Break', true, '2025-2026 Season', '2025-12-18', '2025-12-18', 'Thursday, December 18, 2025'),

-- January 2026 (after holiday break)
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice - Return from Holiday Break', true, '2025-2026 Season', '2026-01-08', '2026-01-08', 'Thursday, January 8, 2026'),
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice', true, '2025-2026 Season', '2026-01-15', '2026-01-15', 'Thursday, January 15, 2026'),
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice', true, '2025-2026 Season', '2026-01-22', '2026-01-22', 'Thursday, January 22, 2026'),
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice', true, '2025-2026 Season', '2026-01-29', '2026-01-29', 'Thursday, January 29, 2026'),

-- February 2026
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice', true, '2025-2026 Season', '2026-02-05', '2026-02-05', 'Thursday, February 5, 2026'),
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice', true, '2025-2026 Season', '2026-02-12', '2026-02-12', 'Thursday, February 12, 2026'),
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice', true, '2025-2026 Season', '2026-02-19', '2026-02-19', 'Thursday, February 19, 2026'),
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice', true, '2025-2026 Season', '2026-02-26', '2026-02-26', 'Thursday, February 26, 2026'),

-- March 2026
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice', true, '2025-2026 Season', '2026-03-05', '2026-03-05', 'Thursday, March 5, 2026'),
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice', true, '2025-2026 Season', '2026-03-12', '2026-03-12', 'Thursday, March 12, 2026'),
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice', true, '2025-2026 Season', '2026-03-19', '2026-03-19', 'Thursday, March 19, 2026'),
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice', true, '2025-2026 Season', '2026-03-26', '2026-03-26', 'Thursday, March 26, 2026'),

-- April 2026
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice', true, '2025-2026 Season', '2026-04-02', '2026-04-02', 'Thursday, April 2, 2026'),
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice', true, '2025-2026 Season', '2026-04-09', '2026-04-09', 'Thursday, April 9, 2026'),
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice', true, '2025-2026 Season', '2026-04-16', '2026-04-16', 'Thursday, April 16, 2026'),
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice', true, '2025-2026 Season', '2026-04-23', '2026-04-23', 'Thursday, April 23, 2026'),
('Thursday', 4, '18:10:00', '19:10:00', 'youth', 'Flyers Skate Zone', 'Rink #3', 'Main Season Practice - Season Finale', true, '2025-2026 Season', '2026-04-30', '2026-04-30', 'Thursday, April 30, 2026');

-- Create a summary view for upcoming practices
CREATE OR REPLACE VIEW upcoming_practices AS
SELECT 
  *,
  TO_CHAR(start_time, 'HH12:MI AM') as start_time_formatted,
  TO_CHAR(end_time, 'HH12:MI AM') as end_time_formatted,
  CASE 
    WHEN effective_from = effective_to THEN TO_CHAR(effective_from::date, 'Day, Month DD, YYYY')
    ELSE 'Recurring'
  END as practice_date
FROM practice_schedules
WHERE is_active = true
  AND effective_from >= CURRENT_DATE
ORDER BY effective_from, start_time;