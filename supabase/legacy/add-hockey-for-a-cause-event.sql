-- Add Hockey for a Cause event to event_visibility table
INSERT INTO event_visibility (event_key, event_name, is_visible, is_featured)
VALUES ('hockey-for-a-cause', 'Hockey for a Cause', true, false)
ON CONFLICT (event_key) DO NOTHING;
