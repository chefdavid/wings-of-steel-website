-- Add is_featured column to event_visibility table
-- Only one event can be featured at a time (shown as CTA in nav)

ALTER TABLE event_visibility
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Ensure only one event can be featured at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_visibility_one_featured
ON event_visibility (is_featured)
WHERE is_featured = true;
