-- Create site_sections table
CREATE TABLE site_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_key TEXT UNIQUE NOT NULL,
    title TEXT,
    content JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create players table
CREATE TABLE players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    age INT NOT NULL,
    position TEXT NOT NULL,
    bio TEXT NOT NULL,
    image_url TEXT NOT NULL,
    jersey_number INT NOT NULL
);

-- Create game_schedule table
CREATE TABLE game_schedule (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date TIMESTAMPTZ NOT NULL,
    opponent TEXT NOT NULL,
    location TEXT NOT NULL,
    home_game BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    status TEXT NOT NULL CHECK (status IN ('Scheduled', 'Cancelled', 'Complete'))
);

-- Enable Row Level Security on all tables
ALTER TABLE site_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_schedule ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for site_sections
-- Allow read access to all users
CREATE POLICY "Allow public read access" ON site_sections
    FOR SELECT USING (true);

-- Allow write access only to admin users
CREATE POLICY "Allow admin insert" ON site_sections
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin update" ON site_sections
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin delete" ON site_sections
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Create RLS policies for players
-- Allow read access to all users
CREATE POLICY "Allow public read access" ON players
    FOR SELECT USING (true);

-- Allow write access only to admin users
CREATE POLICY "Allow admin insert" ON players
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin update" ON players
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin delete" ON players
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Create RLS policies for game_schedule
-- Allow read access to all users
CREATE POLICY "Allow public read access" ON game_schedule
    FOR SELECT USING (true);

-- Allow write access only to admin users
CREATE POLICY "Allow admin insert" ON game_schedule
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin update" ON game_schedule
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin delete" ON game_schedule
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Create indexes for better performance
CREATE INDEX idx_players_jersey_number ON players(jersey_number);
CREATE INDEX idx_game_schedule_date ON game_schedule(date);
CREATE INDEX idx_site_sections_section_key ON site_sections(section_key);