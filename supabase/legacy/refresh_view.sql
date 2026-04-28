-- First, check what Laurel's actual data shows in the base tables
SELECT
    p.id,
    p.first_name,
    p.last_name,
    p.position as player_position,
    tr.team_position,
    tr.team_type
FROM players p
LEFT JOIN team_roster tr ON tr.player_id = p.id
WHERE LOWER(p.first_name) = 'laurel';

-- Check if player_team_details is a materialized view
SELECT
    schemaname,
    matviewname,
    matviewowner,
    ispopulated,
    definition
FROM pg_matviews
WHERE matviewname = 'player_team_details';

-- If it's a materialized view, refresh it
REFRESH MATERIALIZED VIEW IF EXISTS player_team_details;

-- If it's a regular view, drop and recreate it
DROP VIEW IF EXISTS player_team_details CASCADE;

CREATE OR REPLACE VIEW player_team_details AS
SELECT
    p.id,
    p.first_name,
    p.last_name,
    p.birthdate,
    p.start_date,
    p.position,
    p.bio,
    p.image_url,
    p.jersey_number,
    p.tags,
    p.active,
    p.created_at,
    p.hometown,
    p.school,
    p.player_notes,
    p.age,
    tr.team_type,
    tr.team_jersey_number,
    tr.team_position,
    tr.is_captain,
    tr.joined_date,
    tr.status
FROM players p
INNER JOIN team_roster tr ON p.id = tr.player_id
WHERE tr.status = 'active' OR tr.status IS NULL
ORDER BY tr.team_type, tr.team_jersey_number;

-- Grant permissions on the view
GRANT SELECT ON player_team_details TO anon;
GRANT SELECT ON player_team_details TO authenticated;

-- Verify the fix - check Laurel's data in the view
SELECT
    first_name,
    last_name,
    position as player_position,
    team_position,
    team_type
FROM player_team_details
WHERE LOWER(first_name) = 'laurel';