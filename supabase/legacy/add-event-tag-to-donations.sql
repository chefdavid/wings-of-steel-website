-- Add event_tag column to donations table
-- This tracks which event a donation is associated with (e.g. 'hockey-for-a-cause')
ALTER TABLE donations
ADD COLUMN IF NOT EXISTS event_tag TEXT DEFAULT NULL;
