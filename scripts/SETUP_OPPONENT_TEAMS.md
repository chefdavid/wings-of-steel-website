# Setting Up Opponent Teams in Supabase

Follow these steps to create and populate the opponent teams table in your Supabase database.

## Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query" button

## Step 2: Create the Table

Copy and paste this SQL into the editor and run it:

```sql
-- Create opponent_teams table
CREATE TABLE IF NOT EXISTS opponent_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name VARCHAR(255) NOT NULL,
  short_name VARCHAR(100),
  rink_name VARCHAR(255),
  address VARCHAR(500),
  city VARCHAR(100),
  state VARCHAR(2),
  zip VARCHAR(10),
  website VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  facebook VARCHAR(255),
  head_coach VARCHAR(255),
  assistant_coaches TEXT[],
  manager VARCHAR(255),
  president VARCHAR(255),
  founder VARCHAR(255),
  founded_year INTEGER,
  age_range VARCHAR(50),
  program_type VARCHAR(100),
  notes TEXT,
  is_free_program BOOLEAN DEFAULT false,
  sponsor VARCHAR(255),
  logo_url VARCHAR(500),
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_opponent_teams_state ON opponent_teams(state);
CREATE INDEX idx_opponent_teams_program_type ON opponent_teams(program_type);

-- Enable Row Level Security
ALTER TABLE opponent_teams ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access" ON opponent_teams
  FOR SELECT
  TO PUBLIC
  USING (true);

-- Create policy for authenticated users to manage teams
CREATE POLICY "Allow authenticated users to manage teams" ON opponent_teams
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

## Step 3: Insert the Team Data

After the table is created, run this query to insert all the team data:

```sql
-- Insert opponent teams data
INSERT INTO opponent_teams (
  team_name,
  short_name,
  rink_name,
  address,
  city,
  state,
  website,
  email,
  phone,
  facebook,
  head_coach,
  assistant_coaches,
  manager,
  president,
  founder,
  founded_year,
  age_range,
  program_type,
  notes,
  is_free_program,
  sponsor,
  primary_color,
  secondary_color
) VALUES 
(
  'Wings of Steel',
  'Wings',
  'Flyers Skate Zone',
  NULL,
  'Voorhees',
  'NJ',
  'wingsofsteel.org',
  NULL,
  NULL,
  '@wingsofsteel',
  'Paul Valentine',
  NULL,
  'Lori Kile (Brake)',
  NULL,
  'Tom Brake',
  2001,
  '5-18',
  'youth',
  'Youth team ages 5-18, FREE program, Founded 2001',
  true,
  NULL,
  '#1E3A8A',
  '#DC2626'
),
(
  'Hammerheads',
  'Hammerheads',
  'Northeast Skate Zone',
  '10990 Decatur Rd',
  'Philadelphia',
  'PA',
  NULL,
  'info@hammerheads.hockey',
  NULL,
  NULL,
  'Athan Blaine',
  ARRAY['Brian Olsen'],
  NULL,
  'Brian Olsen',
  NULL,
  NULL,
  NULL,
  'full',
  'Full program with adult & junior teams. Head Coach (Junior): Brian Olsen',
  false,
  NULL,
  '#1F2937',
  '#10B981'
),
(
  'DC Sled Sharks',
  'Sled Sharks',
  'MedStar Capitals Iceplex',
  '627 N. Glebe Rd Suite 800',
  'Arlington',
  'VA',
  NULL,
  'sledsharks@medstarnrh.org',
  '(571) 224-0555',
  NULL,
  'Tom Wallace',
  ARRAY['Sean Carlson'],
  NULL,
  NULL,
  NULL,
  NULL,
  '4-18',
  'youth',
  'Ages 4-18, MedStar NRH sponsored',
  false,
  'MedStar NRH',
  '#C8102E',
  '#002B5C'
),
(
  'Bennett Blazers',
  'Blazers',
  'Ice World',
  '1300 Governors Ct',
  'Abingdon',
  'MD',
  'iceworld.com',
  NULL,
  NULL,
  NULL,
  'Billy Zinkhan',
  ARRAY['Noah Grove'],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'youth',
  'Part of Kennedy Krieger Institute. Asst Coach Noah Grove is a Paralympian',
  false,
  'Kennedy Krieger Institute',
  '#FF6F00',
  '#1E3A8A'
),
(
  'Vineland Sled Stars',
  'Sled Stars',
  'Vineland Ice Arena',
  NULL,
  'Vineland',
  'NJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  2002,
  NULL,
  'youth',
  'Founded 2002. Moved from Vineland (original team location)',
  false,
  NULL,
  '#FBBF24',
  '#1E3A8A'
),
(
  'Woodbridge Warriors',
  'Warriors',
  'Woodbridge Community Center',
  NULL,
  'Woodbridge',
  'NJ',
  'warriorssledhockey.org',
  NULL,
  '(732) 586-0520',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'full',
  'Also has special hockey program',
  false,
  NULL,
  '#7C3AED',
  '#DC2626'
),
(
  'Sled Stars',
  'Sled Stars',
  'Hollydell Ice Arena',
  '601 Holly Dell Dr',
  'Sewell',
  'NJ',
  'hollydell.com',
  'info@hollydell.com',
  '(856) 589-5599',
  NULL,
  'Brian Olsen',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'youth',
  'Coach from Williamstown. Sponsored by Weisman''s Children''s Hospital',
  false,
  'Weisman''s Children''s Hospital',
  '#059669',
  '#F59E0B'
),
(
  'Pittsburgh Mighty Penguins',
  'Mighty Penguins',
  'UPMC Lemieux Sports Complex',
  NULL,
  'Pittsburgh',
  'PA',
  'penguinssledhockey.org',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  1998,
  NULL,
  'full',
  'Founded 1998. Multiple teams: Youth Novice, Junior, Adult',
  false,
  'UPMC',
  '#FCB514',
  '#000000'
);
```

## Step 4: Verify the Data

Run this query to verify the data was inserted correctly:

```sql
SELECT * FROM opponent_teams ORDER BY team_name;
```

## Troubleshooting

If you get any errors:

1. **Table already exists**: If you've run the create table script before, you can skip Step 2
2. **Duplicate data**: If you've already inserted data, you might want to clear it first:
   ```sql
   DELETE FROM opponent_teams;
   ```
   Then run the insert script again
3. **Permission errors**: Make sure you're logged into your Supabase account with proper permissions

## Testing the Page

After running these scripts:
1. Start your development server: `npm run dev`
2. Navigate to: `http://localhost:5173/team/youth/opponents`
3. You should see all the opponent teams displayed

The page includes:
- Search functionality
- State and program type filters
- Clickable cards showing team details
- Modal popups with full information