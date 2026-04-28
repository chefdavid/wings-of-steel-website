-- Create table for failed registration attempts
CREATE TABLE IF NOT EXISTS golf_registration_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  captain_info JSONB NOT NULL,
  players JSONB,
  mulligans JSONB,
  add_ons JSONB,
  total_amount NUMERIC(10, 2),
  is_early_bird BOOLEAN DEFAULT false,
  error_message TEXT,
  error_type VARCHAR(50), -- 'validation', 'payment', 'database', 'email', 'other'
  browser_info TEXT,
  attempt_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  followed_up BOOLEAN DEFAULT false,
  follow_up_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_golf_attempts_captain_email ON golf_registration_attempts ((captain_info->>'email'));
CREATE INDEX idx_golf_attempts_attempt_date ON golf_registration_attempts (attempt_date);
CREATE INDEX idx_golf_attempts_followed_up ON golf_registration_attempts (followed_up);
CREATE INDEX idx_golf_attempts_error_type ON golf_registration_attempts (error_type);

-- Enable Row Level Security
ALTER TABLE golf_registration_attempts ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting failed attempts (anyone can insert)
CREATE POLICY "Anyone can insert failed registration attempts"
  ON golf_registration_attempts
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policy for reading (only authenticated users can read)
CREATE POLICY "Only authenticated users can view failed attempts"
  ON golf_registration_attempts
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for updating follow-up status (only authenticated users)
CREATE POLICY "Only authenticated users can update follow-up status"
  ON golf_registration_attempts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create a view for easy querying of recent failed attempts
CREATE OR REPLACE VIEW recent_failed_registrations AS
SELECT 
  id,
  captain_info->>'firstName' as captain_first_name,
  captain_info->>'lastName' as captain_last_name,
  captain_info->>'email' as captain_email,
  captain_info->>'phone' as captain_phone,
  captain_info->>'company' as company,
  jsonb_array_length(players) as num_players,
  total_amount,
  error_type,
  error_message,
  attempt_date,
  followed_up
FROM golf_registration_attempts
WHERE attempt_date > NOW() - INTERVAL '30 days'
ORDER BY attempt_date DESC;

-- Grant access to the view
GRANT SELECT ON recent_failed_registrations TO authenticated;