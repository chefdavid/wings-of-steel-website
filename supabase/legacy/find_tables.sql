-- List all tables in the public schema
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- List all views
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check if there's a table with 'team' in the name
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%team%'
ORDER BY table_name;

-- Check the structure of player_team_details view
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'player_team_details'
ORDER BY ordinal_position;

-- See what Laurel's data looks like in the view
SELECT *
FROM player_team_details
WHERE LOWER(first_name) = 'laurel';