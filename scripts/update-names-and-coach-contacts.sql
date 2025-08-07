-- Update Names and Add Coach Contacts Schema
-- Run this SQL command in your Supabase SQL Editor

-- PART 1: Update Players Table with First/Last Names and Start Date
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS start_date DATE;

-- PART 2: Update Coaches Table with First/Last Names, Start Date, and Contact Information
ALTER TABLE coaches 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS contacts JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS emergency_contact JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS coach_notes TEXT;

-- PART 3: Parse existing player names into first/last names
-- Update existing players by splitting their names (assuming "First Last" format)
UPDATE players SET 
    first_name = TRIM(split_part(name, ' ', 1)),
    last_name = TRIM(COALESCE(NULLIF(split_part(name, ' ', 2), ''), split_part(name, ' ', 1)))
WHERE first_name IS NULL;

-- Handle players with more than 2 names (take first word as first_name, rest as last_name)
UPDATE players SET 
    first_name = TRIM(split_part(name, ' ', 1)),
    last_name = TRIM(substring(name from position(' ' in name) + 1))
WHERE position(' ' in name) > 0 AND length(name) - length(replace(name, ' ', '')) > 1;

-- PART 4: Parse existing coach names into first/last names
UPDATE coaches SET 
    first_name = TRIM(split_part(name, ' ', 1)),
    last_name = TRIM(COALESCE(NULLIF(split_part(name, ' ', 2), ''), split_part(name, ' ', 1)))
WHERE first_name IS NULL;

-- Handle coaches with more than 2 names
UPDATE coaches SET 
    first_name = TRIM(split_part(name, ' ', 1)),
    last_name = TRIM(substring(name from position(' ' in name) + 1))
WHERE position(' ' in name) > 0 AND length(name) - length(replace(name, ' ', '')) > 1;

-- PART 5: Set estimated start dates (you can update these with actual dates later)
-- Set current active players to have joined 2 years ago (approximate)
UPDATE players SET start_date = CURRENT_DATE - INTERVAL '2 years' 
WHERE active = true AND start_date IS NULL;

-- Set inactive players to have joined 3-5 years ago (spread it out)
UPDATE players SET start_date = CURRENT_DATE - INTERVAL '3 years' 
WHERE active = false AND start_date IS NULL;

-- Set coach start dates (estimates based on typical coaching tenure)
UPDATE coaches SET start_date = CURRENT_DATE - INTERVAL '3 years' 
WHERE name = 'Norm Jones' AND start_date IS NULL; -- Head coach, longer tenure

UPDATE coaches SET start_date = CURRENT_DATE - INTERVAL '2 years' 
WHERE name IN ('Rico Gonzales', 'Garret Goebel', 'Stephen Belcher') AND start_date IS NULL; -- Assistant coaches

-- PART 6: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_first_name ON players(first_name);
CREATE INDEX IF NOT EXISTS idx_players_last_name ON players(last_name);
CREATE INDEX IF NOT EXISTS idx_players_start_date ON players(start_date);
CREATE INDEX IF NOT EXISTS idx_coaches_first_name ON coaches(first_name);
CREATE INDEX IF NOT EXISTS idx_coaches_last_name ON coaches(last_name);
CREATE INDEX IF NOT EXISTS idx_coaches_start_date ON coaches(start_date);

-- PART 7: Add comments to explain new fields
COMMENT ON COLUMN players.first_name IS 'Player first name';
COMMENT ON COLUMN players.last_name IS 'Player last name';
COMMENT ON COLUMN players.start_date IS 'Date when player joined the team';
COMMENT ON COLUMN coaches.first_name IS 'Coach first name';
COMMENT ON COLUMN coaches.last_name IS 'Coach last name';
COMMENT ON COLUMN coaches.start_date IS 'Date when coach joined the team';
COMMENT ON COLUMN coaches.contacts IS 'JSONB array of coach contact information';
COMMENT ON COLUMN coaches.emergency_contact IS 'JSONB object for coach emergency contact';
COMMENT ON COLUMN coaches.coach_notes IS 'Notes about coach - certifications, specialties, etc.';

-- PART 8: Verify the updates
SELECT 
    name,
    first_name,
    last_name,
    start_date,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, start_date)) as years_with_team,
    active
FROM players 
ORDER BY active DESC, last_name, first_name
LIMIT 10;

SELECT 
    name,
    first_name,
    last_name,
    role,
    start_date,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, start_date)) as years_with_team
FROM coaches 
ORDER BY start_date
LIMIT 10;

-- PART 9: Show table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('players', 'coaches')
ORDER BY table_name, ordinal_position;