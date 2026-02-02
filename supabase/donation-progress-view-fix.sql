-- Fix donation_progress view to include ALL sales (donations, TopGolf, Hockey for a Cause, etc.)
-- Previously only counted donations with matching campaign_id, missing event-based sales
-- Now counts ALL succeeded payments within the goal's date range
-- Run this in Supabase SQL Editor

DROP VIEW IF EXISTS donation_progress;

CREATE OR REPLACE VIEW donation_progress AS
SELECT
  dg.id as goal_id,
  dg.goal_type,
  dg.goal_name,
  dg.target_amount,
  dg.start_date,
  dg.end_date,
  dg.is_active,
  COALESCE(SUM(d.amount), 0) as current_amount,
  CASE
    WHEN dg.target_amount > 0 THEN
      ROUND((COALESCE(SUM(d.amount), 0) / dg.target_amount) * 100, 2)
    ELSE 0
  END as percentage_complete,
  CASE
    WHEN dg.end_date IS NOT NULL THEN
      GREATEST(0, dg.end_date - CURRENT_DATE)
    ELSE NULL
  END as days_remaining,
  dg.created_at,
  dg.updated_at
FROM donation_goals dg
LEFT JOIN donations d ON
  d.payment_status = 'succeeded'
  AND d.created_at >= dg.start_date
  AND (dg.end_date IS NULL OR d.created_at <= (dg.end_date + INTERVAL '1 day'))
WHERE dg.is_active = true
GROUP BY dg.id, dg.goal_type, dg.goal_name, dg.target_amount, dg.start_date, dg.end_date, dg.is_active, dg.created_at, dg.updated_at;

-- Grant permissions
GRANT SELECT ON donation_progress TO PUBLIC;

-- Verify the view works (uncomment to test)
-- SELECT * FROM donation_progress;
