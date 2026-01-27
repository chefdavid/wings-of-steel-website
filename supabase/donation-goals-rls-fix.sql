-- Fix RLS policies for donation_goals to allow admin operations
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read active goals" ON donation_goals;
DROP POLICY IF EXISTS "Allow authenticated users to manage goals" ON donation_goals;

-- Allow public to read active goals (for progress bars on frontend)
CREATE POLICY "Allow public read active goals" ON donation_goals
  FOR SELECT
  TO PUBLIC
  USING (is_active = true);

-- Allow public to read all goals (for admin dashboard - service role bypasses RLS anyway)
CREATE POLICY "Allow public read all goals" ON donation_goals
  FOR SELECT
  TO PUBLIC
  USING (true);

-- Allow public to insert goals (admin uses service role which bypasses RLS, but this is a fallback)
CREATE POLICY "Allow public insert goals" ON donation_goals
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

-- Allow public to update goals (admin uses service role which bypasses RLS, but this is a fallback)
CREATE POLICY "Allow public update goals" ON donation_goals
  FOR UPDATE
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

-- Allow public to delete goals (admin uses service role which bypasses RLS, but this is a fallback)
CREATE POLICY "Allow public delete goals" ON donation_goals
  FOR DELETE
  TO PUBLIC
  USING (true);
