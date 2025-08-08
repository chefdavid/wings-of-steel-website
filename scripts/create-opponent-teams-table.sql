-- Create opponent_teams table
CREATE TABLE IF NOT EXISTS opponent_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name VARCHAR(255) NOT NULL,
  short_name VARCHAR(100),
  rink_name VARCHAR(255),
  address VARCHAR(500),
  city VARCHAR(100),
  state VARCHAR(2),
  zip VARCHAR(10),
  website VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  facebook VARCHAR(255),
  head_coach VARCHAR(255),
  assistant_coaches TEXT[],
  manager VARCHAR(255),
  president VARCHAR(255),
  founder VARCHAR(255),
  founded_year INTEGER,
  age_range VARCHAR(50),
  program_type VARCHAR(100), -- 'youth', 'adult', 'full', 'special'
  notes TEXT,
  is_free_program BOOLEAN DEFAULT false,
  sponsor VARCHAR(255),
  logo_url VARCHAR(500),
  primary_color VARCHAR(7), -- hex color
  secondary_color VARCHAR(7), -- hex color
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_opponent_teams_state ON opponent_teams(state);
CREATE INDEX idx_opponent_teams_program_type ON opponent_teams(program_type);

-- Enable Row Level Security
ALTER TABLE opponent_teams ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access" ON opponent_teams
  FOR SELECT
  TO PUBLIC
  USING (true);

-- Create policy for authenticated users to manage teams
CREATE POLICY "Allow authenticated users to manage teams" ON opponent_teams
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);