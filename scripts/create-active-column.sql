-- Add active column to players table
-- Run this SQL command in your Supabase SQL Editor

-- Step 1: Add the active column with default value true
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Step 2: Set current active roster players to active (true)
-- and historical players to inactive (false)
UPDATE players SET active = true WHERE name IN (
  'Jack Ashby',
  'Logan Ashby', 
  'Leina Beseler',
  'Andrew Carmen',
  'Lily Corrigan',
  'Autumn Donzuso',
  'AJ Gonzales',
  'Trevor Gregoire',
  'Colten Haas',
  'Laurel Jastrzembski',
  'Mikayla Johnson',
  'Colton Naylor',
  'Shane Philipps',
  'Colin Wiederholt'
);

-- Step 3: Set all other players to inactive
UPDATE players SET active = false WHERE name NOT IN (
  'Jack Ashby',
  'Logan Ashby',
  'Leina Beseler', 
  'Andrew Carmen',
  'Lily Corrigan',
  'Autumn Donzuso',
  'AJ Gonzales',
  'Trevor Gregoire',
  'Colten Haas',
  'Laurel Jastrzembski',
  'Mikayla Johnson',
  'Colton Naylor',
  'Shane Philipps',
  'Colin Wiederholt'
);

-- Step 4: Check the results
SELECT name, jersey_number, position, active 
FROM players 
ORDER BY active DESC, jersey_number;