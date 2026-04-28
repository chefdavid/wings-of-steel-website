-- Create the event_registrations table in Supabase
-- Run this SQL in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_date DATE,

  -- Customer Information
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_company TEXT,
  team_members TEXT,
  special_requests TEXT,

  -- Order Details
  package_name TEXT,
  package_price INTEGER,
  addons JSONB DEFAULT '[]'::jsonb,
  donation_amount INTEGER DEFAULT 0,
  subtotal INTEGER,
  total_amount INTEGER NOT NULL,

  -- Payment Information
  payment_intent_id TEXT UNIQUE,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_name ON event_registrations(event_name);
CREATE INDEX IF NOT EXISTS idx_payment_intent ON event_registrations(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_customer_email ON event_registrations(customer_email);
CREATE INDEX IF NOT EXISTS idx_created_at ON event_registrations(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_status ON event_registrations(payment_status);

-- Create a view for dashboard analytics
CREATE OR REPLACE VIEW event_registrations_summary AS
SELECT
  event_name,
  COUNT(*) as total_registrations,
  COUNT(DISTINCT customer_email) as unique_customers,
  COALESCE(SUM(total_amount), 0) / 100.0 as total_revenue,
  COALESCE(AVG(total_amount), 0) / 100.0 as average_order,
  COALESCE(SUM(donation_amount), 0) / 100.0 as total_donations,
  MAX(created_at) as last_registration,
  MIN(created_at) as first_registration,
  COUNT(CASE WHEN payment_status IN ('completed', 'succeeded') THEN 1 END) as paid_registrations,
  COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_registrations
FROM event_registrations
GROUP BY event_name;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_event_registrations_updated_at
BEFORE UPDATE ON event_registrations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (optional but recommended)
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Create a policy for reading (adjust based on your needs)
CREATE POLICY "Enable read access for all users" ON event_registrations
  FOR SELECT USING (true);

-- Create a policy for inserting (only authenticated users or service role)
CREATE POLICY "Enable insert for service role" ON event_registrations
  FOR INSERT WITH CHECK (true);

-- Create a policy for updating (only service role can update)
CREATE POLICY "Enable update for service role" ON event_registrations
  FOR UPDATE USING (true);

-- Grant permissions (adjust based on your needs)
GRANT SELECT ON event_registrations TO anon;
GRANT ALL ON event_registrations TO service_role;
GRANT SELECT ON event_registrations_summary TO anon;

-- Insert a test record to verify the table works
INSERT INTO event_registrations (
  event_name,
  event_date,
  customer_name,
  customer_email,
  package_name,
  total_amount,
  payment_status
) VALUES (
  'TEST - Delete Me',
  '2024-11-16',
  'Test User',
  'test@example.com',
  'Test Package',
  15000,
  'test'
);

-- Verify the insert worked
SELECT * FROM event_registrations WHERE customer_name = 'Test User';

-- Clean up the test record
DELETE FROM event_registrations WHERE customer_name = 'Test User';

-- Show the final table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'event_registrations'
ORDER BY ordinal_position;