-- Find Laurel's player_id
SELECT id, first_name, last_name, position
FROM players
WHERE LOWER(first_name) = 'laurel';

-- Check current team_roster entry
SELECT tr.*, p.first_name, p.last_name
FROM team_roster tr
JOIN players p ON p.id = tr.player_id
WHERE LOWER(p.first_name) = 'laurel';

-- Update Laurel's position to Offense in team_roster
UPDATE team_roster
SET team_position = 'Offense'
WHERE player_id IN (
  SELECT id FROM players WHERE LOWER(first_name) = 'laurel'
);

-- Verify the update
SELECT tr.*, p.first_name, p.last_name, p.position
FROM team_roster tr
JOIN players p ON p.id = tr.player_id
WHERE LOWER(p.first_name) = 'laurel';