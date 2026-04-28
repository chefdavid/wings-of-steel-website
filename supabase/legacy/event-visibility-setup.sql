-- Create event_visibility table to control which events are visible on the frontend
CREATE TABLE IF NOT EXISTS event_visibility (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_key VARCHAR(50) UNIQUE NOT NULL, -- 'pizza-pins-pop' or 'golf-outing'
  event_name VARCHAR(255) NOT NULL, -- Display name
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_event_visibility_key ON event_visibility(event_key);
CREATE INDEX IF NOT EXISTS idx_event_visibility_visible ON event_visibility(is_visible);

-- Insert default records for existing events
INSERT INTO event_visibility (event_key, event_name, is_visible)
VALUES 
  ('pizza-pins-pop', 'Pizza, Pins & Pop', true),
  ('golf-outing', 'Golf Outing', true)
ON CONFLICT (event_key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE event_visibility ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (frontend needs to check visibility)
CREATE POLICY "Allow public read access" ON event_visibility
  FOR SELECT
  TO PUBLIC
  USING (true);

-- Create policy for authenticated users to manage visibility
CREATE POLICY "Allow authenticated users to manage visibility" ON event_visibility
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_event_visibility_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_event_visibility_updated_at
BEFORE UPDATE ON event_visibility
FOR EACH ROW
EXECUTE FUNCTION update_event_visibility_updated_at();

