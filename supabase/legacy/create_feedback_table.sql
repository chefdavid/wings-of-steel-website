-- Create feedback table for storing website feedback
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  url TEXT NOT NULL,
  selector TEXT,
  position_x INTEGER,
  position_y INTEGER,
  viewport_width INTEGER,
  viewport_height INTEGER,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  resolved BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts (for feedback submission)
CREATE POLICY "Allow anonymous feedback submission" ON feedback
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy to allow authenticated users to read feedback (for you to view)
CREATE POLICY "Allow authenticated users to read feedback" ON feedback
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index for faster queries
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX idx_feedback_resolved ON feedback(resolved);