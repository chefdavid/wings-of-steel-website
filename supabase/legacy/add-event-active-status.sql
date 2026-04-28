-- Add is_active column to event_visibility table
-- This allows admins to mark events as active (upcoming/current) or inactive (past/completed)
ALTER TABLE event_visibility ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_event_visibility_active ON event_visibility(is_active);
