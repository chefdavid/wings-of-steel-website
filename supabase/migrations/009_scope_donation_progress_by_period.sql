-- Scopes the donation_progress view by goal type so the homepage progress
-- bar reflects the *current period*, not all donations since the goal row
-- was created.
--
-- Before this change: a goal_type='monthly' goal with start_date in the past
-- and no end_date would sum every donation since start_date — making the bar
-- read >100% almost immediately and discouraging new gifts.
--
-- New behavior:
--   monthly  → current calendar month
--   annual   → current calendar year
--   campaign → goal.start_date through goal.end_date (unchanged)
--
-- days_remaining is reframed the same way: days until the end of the current
-- period, so the UI no longer shows "null" forever for open-ended monthly goals.

DROP VIEW IF EXISTS donation_progress;

CREATE OR REPLACE VIEW donation_progress AS
WITH goal_window AS (
  SELECT
    dg.*,
    CASE dg.goal_type
      WHEN 'monthly' THEN date_trunc('month', CURRENT_DATE)::date
      WHEN 'annual'  THEN date_trunc('year',  CURRENT_DATE)::date
      ELSE dg.start_date
    END AS window_start,
    CASE dg.goal_type
      WHEN 'monthly' THEN (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::date
      WHEN 'annual'  THEN (date_trunc('year',  CURRENT_DATE) + INTERVAL '1 year')::date
      ELSE dg.end_date
    END AS window_end_exclusive
  FROM donation_goals dg
  WHERE dg.is_active = true
)
SELECT
  gw.id           AS goal_id,
  gw.goal_type,
  gw.goal_name,
  gw.target_amount,
  gw.start_date,
  gw.end_date,
  gw.is_active,
  COALESCE(SUM(d.amount), 0) AS current_amount,
  CASE
    WHEN gw.target_amount > 0 THEN
      ROUND((COALESCE(SUM(d.amount), 0) / gw.target_amount) * 100, 2)
    ELSE 0
  END AS percentage_complete,
  CASE
    WHEN gw.window_end_exclusive IS NOT NULL THEN
      GREATEST(0, gw.window_end_exclusive - CURRENT_DATE)
    ELSE NULL
  END AS days_remaining,
  gw.created_at,
  gw.updated_at
FROM goal_window gw
LEFT JOIN donations d ON
  d.payment_status IN ('succeeded', 'pending')
  AND d.stripe_payment_intent_id IS NOT NULL
  AND d.created_at >= gw.window_start
  AND (gw.window_end_exclusive IS NULL OR d.created_at < gw.window_end_exclusive)
GROUP BY
  gw.id, gw.goal_type, gw.goal_name, gw.target_amount,
  gw.start_date, gw.end_date, gw.is_active,
  gw.window_end_exclusive, gw.created_at, gw.updated_at;

GRANT SELECT ON donation_progress TO PUBLIC;
