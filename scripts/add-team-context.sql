-- Add team context to existing database schema
-- This script adds team_type column to all relevant tables to support multi-team functionality

-- 1. Add team_type column to players table
ALTER TABLE players ADD COLUMN team_type VARCHAR(10) DEFAULT 'youth';

-- 2. Add team_type column to coaches table
ALTER TABLE coaches ADD COLUMN team_type VARCHAR(10) DEFAULT 'youth';

-- 3. Add team_type column to site_sections table (for team-specific content)
ALTER TABLE site_sections ADD COLUMN team_type VARCHAR(10) DEFAULT 'youth';

-- 4. Create user_roles table for admin access control
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    team_type VARCHAR(10), -- null = master admin, 'youth'/'adult' = team-specific admin
    role VARCHAR(20) NOT NULL CHECK (role IN ('master_admin', 'team_admin', 'viewer')),
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, team_type)
);

-- 5. Create team_settings table for team-specific configurations
CREATE TABLE IF NOT EXISTS team_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_type VARCHAR(10) NOT NULL UNIQUE,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Insert default team settings
INSERT INTO team_settings (team_type, settings) VALUES 
    ('youth', '{"stripe_account_id": null, "primary_color": "#4682B4", "secondary_color": "#2C3E50"}'),
    ('adult', '{"stripe_account_id": null, "primary_color": "#B4462F", "secondary_color": "#1A1A1A"}')
ON CONFLICT (team_type) DO NOTHING;

-- 7. Add constraints to ensure team_type values are valid
ALTER TABLE players ADD CONSTRAINT check_team_type CHECK (team_type IN ('youth', 'adult'));
ALTER TABLE coaches ADD CONSTRAINT check_coach_team_type CHECK (team_type IN ('youth', 'adult'));
ALTER TABLE site_sections ADD CONSTRAINT check_section_team_type CHECK (team_type IN ('youth', 'adult'));
ALTER TABLE user_roles ADD CONSTRAINT check_role_team_type CHECK (team_type IS NULL OR team_type IN ('youth', 'adult'));
ALTER TABLE team_settings ADD CONSTRAINT check_settings_team_type CHECK (team_type IN ('youth', 'adult'));

-- 8. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_players_team_type ON players(team_type);
CREATE INDEX IF NOT EXISTS idx_coaches_team_type ON coaches(team_type);
CREATE INDEX IF NOT EXISTS idx_site_sections_team_type ON site_sections(team_type);
CREATE INDEX IF NOT EXISTS idx_user_roles_team_type ON user_roles(team_type);

-- 9. Add RLS (Row Level Security) policies for team-specific access
-- Enable RLS on all team-contextual tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_settings ENABLE ROW LEVEL SECURITY;

-- Players policies
DROP POLICY IF EXISTS "Enable read access for all users" ON players;
CREATE POLICY "Enable read access for all users" ON players FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON players;
CREATE POLICY "Enable insert for authenticated users" ON players FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON players;
CREATE POLICY "Enable update for authenticated users" ON players FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON players;
CREATE POLICY "Enable delete for authenticated users" ON players FOR DELETE USING (true);

-- Coaches policies
DROP POLICY IF EXISTS "Enable read access for all users" ON coaches;
CREATE POLICY "Enable read access for all users" ON coaches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON coaches;
CREATE POLICY "Enable insert for authenticated users" ON coaches FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON coaches;
CREATE POLICY "Enable update for authenticated users" ON coaches FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON coaches;
CREATE POLICY "Enable delete for authenticated users" ON coaches FOR DELETE USING (true);

-- Site sections policies
DROP POLICY IF EXISTS "Enable read access for all users" ON site_sections;
CREATE POLICY "Enable read access for all users" ON site_sections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON site_sections;
CREATE POLICY "Enable insert for authenticated users" ON site_sections FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON site_sections;
CREATE POLICY "Enable update for authenticated users" ON site_sections FOR UPDATE USING (true);

-- User roles policies (only accessible by master admins and the user themselves)
DROP POLICY IF EXISTS "Enable read for master admins and own records" ON user_roles;
CREATE POLICY "Enable read for master admins and own records" ON user_roles FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.role = 'master_admin'
    )
);

-- Team settings policies (read for all, write for admins)
DROP POLICY IF EXISTS "Enable read access for all users" ON team_settings;
CREATE POLICY "Enable read access for all users" ON team_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable update for admins" ON team_settings;
CREATE POLICY "Enable update for admins" ON team_settings FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND (ur.role = 'master_admin' OR (ur.role = 'team_admin' AND ur.team_type = team_settings.team_type))
    )
);