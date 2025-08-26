-- Create team registrations table
CREATE TABLE IF NOT EXISTS team_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  parent_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  diagnosis TEXT,
  experience_level VARCHAR(50) NOT NULL,
  additional_info TEXT,
  emergency_contact VARCHAR(255) NOT NULL,
  emergency_phone VARCHAR(50) NOT NULL,
  how_heard VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, contacted, enrolled, waitlist
  notes TEXT, -- for admin use
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE team_registrations ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (submit forms)
CREATE POLICY "Allow public to submit registrations" ON team_registrations
  FOR INSERT TO PUBLIC
  WITH CHECK (true);

-- Only authenticated users can view registrations
CREATE POLICY "Authenticated users can view registrations" ON team_registrations
  FOR SELECT TO authenticated
  USING (true);

-- Only authenticated users can update registrations
CREATE POLICY "Authenticated users can update registrations" ON team_registrations
  FOR UPDATE TO authenticated
  USING (true);

-- Create index for faster queries
CREATE INDEX idx_team_registrations_status ON team_registrations(status);
CREATE INDEX idx_team_registrations_email ON team_registrations(email);
CREATE INDEX idx_team_registrations_submitted_at ON team_registrations(submitted_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_team_registrations_updated_at BEFORE UPDATE ON team_registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT INSERT ON team_registrations TO anon;
GRANT SELECT, UPDATE ON team_registrations TO authenticated;