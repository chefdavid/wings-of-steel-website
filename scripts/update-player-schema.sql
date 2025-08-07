-- Enhanced Player Database Schema Update
-- Run this SQL command in your Supabase SQL Editor

-- Step 1: Add the active column if it doesn't exist
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Step 2: Add birthdate column (replacing age concept)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS birthdate DATE;

-- Step 3: Add contact information as JSONB for flexibility
-- This allows multiple contacts with different types and primary designation
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS contacts JSONB DEFAULT '[]'::jsonb;

-- Step 4: Add emergency contact information
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS emergency_contact JSONB DEFAULT '{}'::jsonb;

-- Step 5: Add medical information (optional)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS medical_info JSONB DEFAULT '{}'::jsonb;

-- Step 6: Update existing players with approximate birthdates based on current age
-- This is a one-time conversion from age to birthdate
-- You may want to update these with actual birthdates later

UPDATE players SET birthdate = CURRENT_DATE - INTERVAL '13 years' WHERE name = 'AJ Gonzales';
UPDATE players SET birthdate = CURRENT_DATE - INTERVAL '13 years' WHERE name = 'Lily Corrigan';
UPDATE players SET birthdate = CURRENT_DATE - INTERVAL '14 years' WHERE name = 'Logan Ashby';
UPDATE players SET birthdate = CURRENT_DATE - INTERVAL '14 years' WHERE name = 'Mikayla Johnson';
UPDATE players SET birthdate = CURRENT_DATE - INTERVAL '14 years' WHERE name = 'Leina Beseler';
UPDATE players SET birthdate = CURRENT_DATE - INTERVAL '15 years' WHERE name = 'Shane Philipps';
UPDATE players SET birthdate = CURRENT_DATE - INTERVAL '15 years' WHERE name = 'Lucas Harrop';
UPDATE players SET birthdate = CURRENT_DATE - INTERVAL '15 years' WHERE name = 'Shawn Gardner';
UPDATE players SET birthdate = CURRENT_DATE - INTERVAL '15 years' WHERE name = 'Autumn Donzuso';
UPDATE players SET birthdate = CURRENT_DATE - INTERVAL '16 years' WHERE name = 'Jack Ashby';
UPDATE players SET birthdate = CURRENT_DATE - INTERVAL '16 years' WHERE name = 'Trevor Gregoire';
UPDATE players SET birthdate = CURRENT_DATE - INTERVAL '16 years' WHERE name = 'Colin Wiederholt';
UPDATE players SET birthdate = CURRENT_DATE - INTERVAL '16 years' WHERE name = 'Zach Oxenham';
UPDATE players SET birthdate = CURRENT_DATE - INTERVAL '16 years' WHERE name = 'Colten Haas';
UPDATE players SET birthdate = CURRENT_DATE - INTERVAL '17 years' WHERE name = 'Andrew Carmen';
UPDATE players SET birthdate = CURRENT_DATE - INTERVAL '17 years' WHERE name = 'Colton Naylor';
UPDATE players SET birthdate = CURRENT_DATE - INTERVAL '17 years' WHERE name = 'Laurel Jastrzembski';

-- Step 7: Set current roster to active and others to inactive
UPDATE players SET active = true WHERE name IN (
  'Jack Ashby', 'Logan Ashby', 'Leina Beseler', 'Andrew Carmen',
  'Lily Corrigan', 'Autumn Donzuso', 'AJ Gonzales', 'Trevor Gregoire',
  'Colten Haas', 'Laurel Jastrzembski', 'Mikayla Johnson', 'Colton Naylor',
  'Shane Philipps', 'Colin Wiederholt'
);

UPDATE players SET active = false WHERE name NOT IN (
  'Jack Ashby', 'Logan Ashby', 'Leina Beseler', 'Andrew Carmen',
  'Lily Corrigan', 'Autumn Donzuso', 'AJ Gonzales', 'Trevor Gregoire',
  'Colten Haas', 'Laurel Jastrzembski', 'Mikayla Johnson', 'Colton Naylor',
  'Shane Philipps', 'Colin Wiederholt'
);

-- Step 8: Add sample contact data structure (you can update these with real data)
-- Example of contacts JSONB structure:
-- [
--   {
--     "type": "parent",
--     "name": "John Smith", 
--     "phone": "555-0123",
--     "email": "john@example.com",
--     "address": {
--       "street": "123 Main St",
--       "city": "Anytown", 
--       "state": "NJ",
--       "zip": "12345"
--     },
--     "relationship": "Father",
--     "primary": true
--   },
--   {
--     "type": "parent",
--     "name": "Jane Smith",
--     "phone": "555-0124", 
--     "email": "jane@example.com",
--     "address": {
--       "street": "123 Main St",
--       "city": "Anytown", 
--       "state": "NJ", 
--       "zip": "12345"
--     },
--     "relationship": "Mother",
--     "primary": false
--   }
-- ]

-- Step 9: Verify the new schema
SELECT 
  name, 
  jersey_number, 
  position, 
  active,
  birthdate,
  EXTRACT(YEAR FROM AGE(birthdate)) as calculated_age,
  contacts,
  emergency_contact
FROM players 
ORDER BY active DESC, jersey_number
LIMIT 5;

-- Step 10: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_active ON players(active);
CREATE INDEX IF NOT EXISTS idx_players_birthdate ON players(birthdate);

COMMENT ON COLUMN players.contacts IS 'JSONB array of contact information - parents, guardians, etc.';
COMMENT ON COLUMN players.emergency_contact IS 'JSONB object for emergency contact information';
COMMENT ON COLUMN players.medical_info IS 'JSONB object for medical information, allergies, medications, etc.';
COMMENT ON COLUMN players.birthdate IS 'Player birthdate - age calculated dynamically';