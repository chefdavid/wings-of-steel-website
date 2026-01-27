-- Fix donation_progress view to include created_at and updated_at in GROUP BY
-- Run this in Supabase SQL Editor

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
LEFT JOIN donations d ON d.campaign_id = dg.id AND d.payment_status = 'succeeded'
WHERE dg.is_active = true
GROUP BY dg.id, dg.goal_type, dg.goal_name, dg.target_amount, dg.start_date, dg.end_date, dg.is_active, dg.created_at, dg.updated_at;



