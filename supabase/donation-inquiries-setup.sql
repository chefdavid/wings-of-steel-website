-- Create donation_inquiries table
CREATE TABLE IF NOT EXISTS donation_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  interest_area TEXT DEFAULT 'general',
  message TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE donation_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert (website visitors submitting the form)
CREATE POLICY "Allow anonymous insert on donation_inquiries"
  ON donation_inquiries
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users (admin) to read all inquiries
CREATE POLICY "Allow authenticated select on donation_inquiries"
  ON donation_inquiries
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users (admin) to update inquiries (mark as read, etc.)
CREATE POLICY "Allow authenticated update on donation_inquiries"
  ON donation_inquiries
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
