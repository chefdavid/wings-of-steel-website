-- Check existing data and insert only if not exists

-- First, let's see what we have
SELECT 'site_sections' as table_name, COUNT(*) as row_count FROM site_sections
UNION ALL
SELECT 'players', COUNT(*) FROM players
UNION ALL
SELECT 'game_schedule', COUNT(*) FROM game_schedule;

-- Insert site_sections only if they don't exist
INSERT INTO site_sections (section_key, title, content) 
VALUES
('hero', 'Wings of Steel', '{
  "title": "Wings of Steel",
  "subtitle": "2023 National Champions",
  "tagline": "No child pays to play",
  "description": "Michigan''s premier youth sled hockey team, building champions on and off the ice"
}'::jsonb),
('about', 'About Wings of Steel', '{
  "mission": "Making sled hockey accessible to all children regardless of financial ability",
  "features": [
    {
      "title": "No Cost to Families",
      "description": "100% funded through donations and sponsorships",
      "icon": "dollar"
    },
    {
      "title": "Championship Program",
      "description": "National champions with elite coaching staff",
      "icon": "trophy"
    },
    {
      "title": "Inclusive Community",
      "description": "Players of all abilities welcome, ages 5-19",
      "icon": "heart"
    }
  ],
  "description": "Wings of Steel is dedicated to providing youth with disabilities the opportunity to play competitive sled hockey. Our program removes all financial barriers, ensuring every child can experience the thrill of team sports."
}'::jsonb),
('contact', 'Contact Information', '{
  "email": "info@wingsofsteel.org",
  "phone": "(248) 555-0100",
  "address": {
    "street": "123 Hockey Lane",
    "city": "Detroit",
    "state": "MI",
    "zip": "48201"
  },
  "social": {
    "facebook": "https://facebook.com/wingsofsteel",
    "instagram": "https://instagram.com/wingsofsteel",
    "twitter": "https://twitter.com/wingsofsteel"
  }
}'::jsonb),
('get_involved', 'Get Involved', '{
  "volunteer": {
    "title": "Volunteer Opportunities",
    "description": "Help us make a difference in young athletes'' lives",
    "opportunities": [
      "On-ice assistants",
      "Equipment managers",
      "Fundraising support",
      "Event coordination"
    ]
  },
  "donate": {
    "title": "Support Our Mission",
    "description": "Your donation keeps our program free for all families",
    "levels": [
      {"name": "Bronze", "amount": 250},
      {"name": "Silver", "amount": 500},
      {"name": "Gold", "amount": 1000},
      {"name": "Platinum", "amount": 2500}
    ]
  }
}'::jsonb)
ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  updated_at = NOW();

-- Clear existing players and insert fresh data
TRUNCATE TABLE players CASCADE;
INSERT INTO players (name, age, position, bio, image_url, jersey_number) VALUES
('Alex Thompson', 12, 'Forward', 'Alex has been playing sled hockey for 3 years and loves scoring goals. Favorite NHL team: Detroit Red Wings.', '/assets/players/alex.jpg', 7),
('Jordan Lee', 14, 'Defense', 'Jordan is a defensive powerhouse who started playing at age 8. Team captain and mentor to younger players.', '/assets/players/jordan.jpg', 23),
('Sam Rodriguez', 10, 'Goalie', 'Sam joined the team last year and quickly became our star goalie. Dreams of playing in the Paralympics.', '/assets/players/sam.jpg', 1),
('Taylor Chen', 16, 'Forward', 'Taylor is our leading scorer and has been with Wings of Steel since the beginning. Committed to playing college hockey.', '/assets/players/taylor.jpg', 19),
('Morgan Davis', 11, 'Defense', 'Morgan loves the team spirit and making new friends. Started playing hockey after watching the Paralympics.', '/assets/players/morgan.jpg', 44),
('Casey Wilson', 13, 'Forward', 'Casey brings incredible energy to every practice and game. Favorite part of hockey: celebrating with teammates.', '/assets/players/casey.jpg', 88),
('Riley Martinez', 15, 'Defense', 'Riley is known for powerful slap shots and positive attitude. Helps coach the younger players.', '/assets/players/riley.jpg', 12),
('Jamie Park', 9, 'Forward', 'Jamie is our youngest player but plays with the heart of a champion. Loves the speed of sled hockey.', '/assets/players/jamie.jpg', 99);

-- Clear existing games and insert fresh data
TRUNCATE TABLE game_schedule CASCADE;
INSERT INTO game_schedule (date, opponent, location, home_game, notes, status) VALUES
-- Past games
('2024-01-15 14:00:00-05', 'Chicago Hornets', 'Wings Arena, Detroit MI', true, 'Season opener', 'Complete'),
('2024-01-22 13:00:00-05', 'Pittsburgh Penguins', 'PPG Paints Arena, Pittsburgh PA', false, NULL, 'Complete'),
('2024-02-05 15:00:00-05', 'Buffalo Sabres', 'Wings Arena, Detroit MI', true, 'Disability Awareness Night', 'Complete'),
('2024-02-12 14:00:00-05', 'Minnesota Wild', 'Xcel Energy Center, St. Paul MN', false, 'Tournament game', 'Complete'),
-- Upcoming games
('2025-02-15 14:00:00-05', 'Columbus Blue Jackets', 'Wings Arena, Detroit MI', true, 'Family Day celebration', 'Scheduled'),
('2025-02-22 13:00:00-05', 'Nashville Predators', 'Bridgestone Arena, Nashville TN', false, NULL, 'Scheduled'),
('2025-03-01 15:00:00-05', 'St. Louis Blues', 'Wings Arena, Detroit MI', true, 'Fundraiser game', 'Scheduled'),
('2025-03-08 14:00:00-05', 'Colorado Avalanche', 'Ball Arena, Denver CO', false, 'Regional championship', 'Scheduled'),
('2025-03-15 16:00:00-05', 'Dallas Stars', 'Wings Arena, Detroit MI', true, 'Senior night', 'Scheduled'),
('2025-03-22 14:00:00-05', 'San Jose Sharks', 'SAP Center, San Jose CA', false, 'National tournament', 'Scheduled');

-- Show final counts
SELECT 'Final counts:' as info;
SELECT 'site_sections' as table_name, COUNT(*) as row_count FROM site_sections
UNION ALL
SELECT 'players', COUNT(*) FROM players
UNION ALL
SELECT 'game_schedule', COUNT(*) FROM game_schedule;