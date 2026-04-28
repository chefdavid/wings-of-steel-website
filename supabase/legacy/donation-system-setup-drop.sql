-- Drop existing tables if they exist (run this first if you need to reset)
DROP TABLE IF EXISTS donation_subscriptions CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS donation_goals CASCADE;
DROP VIEW IF EXISTS donation_progress CASCADE;
DROP VIEW IF EXISTS donation_statistics CASCADE;
DROP FUNCTION IF EXISTS update_donation_updated_at() CASCADE;



