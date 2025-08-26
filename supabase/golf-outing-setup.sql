-- Create golf_registrations table
CREATE TABLE IF NOT EXISTS golf_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  captain_info JSONB NOT NULL,
  players JSONB NOT NULL,
  mulligans JSONB,
  add_ons JSONB,
  total_amount DECIMAL(10,2) NOT NULL,
  is_early_bird BOOLEAN DEFAULT false,
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_date TIMESTAMP,
  confirmation_sent BOOLEAN DEFAULT false,
  registration_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_golf_registrations_payment_status 
ON golf_registrations(payment_status);

CREATE INDEX IF NOT EXISTS idx_golf_registrations_registration_date 
ON golf_registrations(registration_date);

-- Create golf_sponsorships table
CREATE TABLE IF NOT EXISTS golf_sponsorships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_level VARCHAR(50) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  logo_url TEXT,
  amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for sponsorships
CREATE INDEX IF NOT EXISTS idx_golf_sponsorships_sponsor_level 
ON golf_sponsorships(sponsor_level);

CREATE INDEX IF NOT EXISTS idx_golf_sponsorships_payment_status 
ON golf_sponsorships(payment_status);

-- Create golf_donations table
CREATE TABLE IF NOT EXISTS golf_donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_name VARCHAR(255) NOT NULL,
  donor_email VARCHAR(255) NOT NULL,
  donor_phone VARCHAR(50),
  amount DECIMAL(10,2) NOT NULL,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create email_queue table for handling confirmation emails
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,
  html TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  type VARCHAR(50),
  attempts INT DEFAULT 0,
  last_attempt TIMESTAMP,
  sent_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_golf_registrations_updated_at 
BEFORE UPDATE ON golf_registrations 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_golf_sponsorships_updated_at 
BEFORE UPDATE ON golf_sponsorships 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE golf_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE golf_sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE golf_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
-- Allow anyone to read registrations (for displaying counts)
CREATE POLICY "Enable read access for all users" ON golf_registrations
  FOR SELECT USING (true);

-- Allow anyone to insert registrations
CREATE POLICY "Enable insert for all users" ON golf_registrations
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read sponsorships
CREATE POLICY "Enable read access for all users" ON golf_sponsorships
  FOR SELECT USING (true);

-- Allow anyone to insert sponsorships
CREATE POLICY "Enable insert for all users" ON golf_sponsorships
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read donations
CREATE POLICY "Enable read access for all users" ON golf_donations
  FOR SELECT USING (true);

-- Allow anyone to insert donations
CREATE POLICY "Enable insert for all users" ON golf_donations
  FOR INSERT WITH CHECK (true);

-- Email queue policies
CREATE POLICY "Enable insert for all users" ON email_queue
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for all users" ON email_queue
  FOR SELECT USING (true);

-- Optional: Create a view for registration statistics
CREATE OR REPLACE VIEW golf_registration_stats AS
SELECT 
  COUNT(*) as total_registrations,
  SUM(CAST(players->>'length' AS INT)) as total_players,
  SUM(total_amount) as total_revenue,
  COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as paid_registrations,
  COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_registrations
FROM golf_registrations;

-- Grant access to the view
GRANT SELECT ON golf_registration_stats TO anon, authenticated;