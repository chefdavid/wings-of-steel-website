-- Contact form tables for Wings of Steel website
-- Run this SQL in the Supabase SQL Editor

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mailing_list table
CREATE TABLE IF NOT EXISTS mailing_list (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_at ON contact_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_read ON contact_submissions(read);
CREATE INDEX IF NOT EXISTS idx_mailing_list_email ON mailing_list(email);
CREATE INDEX IF NOT EXISTS idx_mailing_list_active ON mailing_list(active);

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mailing_list ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow anyone to insert contact submissions and mailing list signups
DROP POLICY IF EXISTS "Allow anonymous insert contact submissions" ON contact_submissions;
CREATE POLICY "Allow anonymous insert contact submissions" ON contact_submissions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous insert mailing list" ON mailing_list;
CREATE POLICY "Allow anonymous insert mailing list" ON mailing_list
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users (admins) to read all data
DROP POLICY IF EXISTS "Allow authenticated read contact submissions" ON contact_submissions;
CREATE POLICY "Allow authenticated read contact submissions" ON contact_submissions
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated read mailing list" ON mailing_list;
CREATE POLICY "Allow authenticated read mailing list" ON mailing_list
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to update read status
DROP POLICY IF EXISTS "Allow authenticated update contact submissions" ON contact_submissions;
CREATE POLICY "Allow authenticated update contact submissions" ON contact_submissions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to update mailing list status
DROP POLICY IF EXISTS "Allow authenticated update mailing list" ON mailing_list;
CREATE POLICY "Allow authenticated update mailing list" ON mailing_list
  FOR UPDATE USING (auth.role() = 'authenticated');