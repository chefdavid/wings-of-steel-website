-- Summer 2026 practice sessions: June 18, July 16, August 13 at 6:00 PM
-- Deactivate any remaining active regular-season practices, then upsert summer dates.

UPDATE practice_schedules
SET is_active = false, updated_at = NOW()
WHERE is_active = true
  AND season != 'Summer 2026'
  AND effective_to >= CURRENT_DATE;

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
  practice_date,
  effective_from,
  effective_to,
  notes
) VALUES
('Thursday', 4, '18:00:00', '19:00:00', 'youth', 'Flyers Skate Zone', 'Flyers Ice Rink', 'Summer Practice Session', true, 'Summer 2026', '2026-06-18', '2026-06-18', '2026-06-18', 'Thursday, June 18, 2026 at 6:00 PM'),
('Thursday', 4, '18:00:00', '19:00:00', 'youth', 'Flyers Skate Zone', 'Flyers Ice Rink', 'Summer Practice Session', true, 'Summer 2026', '2026-07-16', '2026-07-16', '2026-07-16', 'Thursday, July 16, 2026 at 6:00 PM'),
('Thursday', 4, '18:00:00', '19:00:00', 'youth', 'Flyers Skate Zone', 'Flyers Ice Rink', 'Summer Practice Session', true, 'Summer 2026', '2026-08-13', '2026-08-13', '2026-08-13', 'Thursday, August 13, 2026 at 6:00 PM')
ON CONFLICT DO NOTHING;
