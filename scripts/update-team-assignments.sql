-- Update team system to support multiple team assignments per player/coach
-- This allows players and coaches to be on both youth and adult teams

-- 1. Remove the single team_type column approach and create junction tables
ALTER TABLE players DROP COLUMN IF EXISTS team_type;
ALTER TABLE coaches DROP COLUMN IF EXISTS team_type;

-- 2. Create player_teams junction table
CREATE TABLE IF NOT EXISTS player_teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    team_type VARCHAR(10) NOT NULL CHECK (team_type IN ('youth', 'adult')),
    jersey_number INTEGER,
    position VARCHAR(20),
    is_captain BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_id, team_type)
);

-- 3. Create coach_teams junction table
CREATE TABLE IF NOT EXISTS coach_teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
    team_type VARCHAR(10) NOT NULL CHECK (team_type IN ('youth', 'adult')),
    role VARCHAR(50),
    is_head_coach BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(coach_id, team_type)
);

-- 4. Assign all existing players to youth team
INSERT INTO player_teams (player_id, team_type, jersey_number, position)
SELECT 
    id, 
    'youth' as team_type,
    jersey_number,
    position
FROM players
ON CONFLICT (player_id, team_type) DO NOTHING;

-- 5. Assign all existing coaches to youth team  
INSERT INTO coach_teams (coach_id, team_type, role)
SELECT 
    id,
    'youth' as team_type,
    role
FROM coaches
ON CONFLICT (coach_id, team_type) DO NOTHING;

-- 6. Create some sample adult team data by duplicating some youth players
-- (You can modify these player IDs based on your actual data)
INSERT INTO player_teams (player_id, team_type, jersey_number, position)
SELECT 
    player_id,
    'adult' as team_type,
    jersey_number + 20, -- Different jersey numbers for adult team
    position
FROM player_teams 
WHERE team_type = 'youth' 
AND player_id IN (
    SELECT id FROM players LIMIT 5 -- Takes first 5 players
)
ON CONFLICT (player_id, team_type) DO NOTHING;

-- 7. Create some sample adult coaches
INSERT INTO coach_teams (coach_id, team_type, role)
SELECT 
    coach_id,
    'adult' as team_type,
    CASE 
        WHEN role = 'Head Coach' THEN 'Assistant Coach'
        ELSE 'Head Coach'
    END as role
FROM coach_teams 
WHERE team_type = 'youth'
AND coach_id IN (
    SELECT id FROM coaches LIMIT 2 -- Takes first 2 coaches
)
ON CONFLICT (coach_id, team_type) DO NOTHING;

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_player_teams_player_id ON player_teams(player_id);
CREATE INDEX IF NOT EXISTS idx_player_teams_team_type ON player_teams(team_type);
CREATE INDEX IF NOT EXISTS idx_coach_teams_coach_id ON coach_teams(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_teams_team_type ON coach_teams(team_type);

-- 9. Create views for easier querying
CREATE OR REPLACE VIEW player_team_details AS
SELECT 
    p.*,
    pt.team_type,
    pt.jersey_number as team_jersey_number,
    pt.position as team_position,
    pt.is_captain
FROM players p
JOIN player_teams pt ON p.id = pt.player_id
WHERE p.active = true;

CREATE OR REPLACE VIEW coach_team_details AS
SELECT 
    c.*,
    ct.team_type,
    ct.role as team_role,
    ct.is_head_coach
FROM coaches c
JOIN coach_teams ct ON c.id = ct.coach_id;