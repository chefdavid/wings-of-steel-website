-- Clear existing players and add real Wings of Steel roster
TRUNCATE TABLE players RESTART IDENTITY CASCADE;

-- Insert actual Wings of Steel players
INSERT INTO players (name, age, position, bio, jersey_number, tags, image_url) VALUES
-- Forwards
('Jack Ashby', 16, 'Forward', 'Dedicated forward with excellent puck handling skills and team leadership qualities.', 20, ARRAY['Captain'], NULL),
('Logan Ashby', 14, 'Forward', 'Quick and agile forward with a natural scoring ability and great ice vision.', 22, ARRAY[]::TEXT[], NULL),
('Andrew Carmen', 17, 'Forward', 'Powerful forward with strong shooting accuracy and exceptional teamwork skills.', 49, ARRAY[]::TEXT[], NULL),
('Shawn Gardner', 15, 'Forward', 'Energetic forward known for creating scoring opportunities and motivating teammates.', 26, ARRAY[]::TEXT[], NULL),
('AJ Gonzales', 13, 'Forward', 'Dynamic forward with incredible speed and determination on the ice.', 8, ARRAY['Assistant Captain'], NULL),
('Trevor Gregoire', 16, 'Forward', 'Skilled forward with excellent stick handling and strategic game awareness.', 21, ARRAY[]::TEXT[], NULL),
('Lucas Harrop', 15, 'Forward', 'Versatile forward who brings consistency and reliability to every game.', 19, ARRAY[]::TEXT[], NULL),
('Mikayla Johnson', 14, 'Forward', 'Talented forward with natural hockey instincts and strong competitive spirit.', 11, ARRAY[]::TEXT[], NULL),
('Colton Naylor', 17, 'Forward', 'Strong forward with excellent positioning and ability to control the game pace.', 45, ARRAY[]::TEXT[], NULL),
('Zach Oxenham', 16, 'Forward', 'Determined forward known for his work ethic and ability to perform under pressure.', 18, ARRAY[]::TEXT[], NULL),

-- Defense
('Shane Phillips', 15, 'Defense', 'Solid defenseman with excellent positioning and strong defensive awareness.', 2, ARRAY[]::TEXT[], NULL),
('Colin Wiederholt', 16, 'Defense', 'Reliable defenseman who excels at reading the game and supporting teammates.', 7, ARRAY[]::TEXT[], NULL),

-- Goalies  
('Lily Corrigan', 13, 'Goalie', 'Promising goaltender with quick reflexes and strong mental focus between the pipes. Jersey number to be determined.', 0, ARRAY['Number TBD'], NULL),
('Laurel Jastrzembski', 17, 'Goalie', 'Experienced goaltender known for her calm demeanor and excellent game management.', 44, ARRAY[]::TEXT[], NULL);