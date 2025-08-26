const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupGolfTables() {
  try {
    // Create golf_registrations table
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS golf_registrations (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          captain_info JSONB NOT NULL,
          players JSONB NOT NULL,
          mulligans JSONB,
          add_ons JSONB,
          total_amount DECIMAL(10,2) NOT NULL,
          is_early_bird BOOLEAN DEFAULT false,
          payment_status VARCHAR(50) DEFAULT 'pending',
          payment_method VARCHAR(50),
          payment_date TIMESTAMP,
          confirmation_sent BOOLEAN DEFAULT false,
          registration_date TIMESTAMP DEFAULT NOW(),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        -- Create indexes for better query performance
        CREATE INDEX IF NOT EXISTS idx_golf_registrations_payment_status 
        ON golf_registrations(payment_status);
        
        CREATE INDEX IF NOT EXISTS idx_golf_registrations_registration_date 
        ON golf_registrations(registration_date);

        -- Create golf_sponsorships table
        CREATE TABLE IF NOT EXISTS golf_sponsorships (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          sponsor_level VARCHAR(50) NOT NULL,
          company_name VARCHAR(255) NOT NULL,
          contact_name VARCHAR(255) NOT NULL,
          contact_email VARCHAR(255) NOT NULL,
          contact_phone VARCHAR(50),
          logo_url TEXT,
          amount DECIMAL(10,2) NOT NULL,
          payment_status VARCHAR(50) DEFAULT 'pending',
          payment_method VARCHAR(50),
          payment_date TIMESTAMP,
          notes TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        -- Create indexes for sponsorships
        CREATE INDEX IF NOT EXISTS idx_golf_sponsorships_sponsor_level 
        ON golf_sponsorships(sponsor_level);
        
        CREATE INDEX IF NOT EXISTS idx_golf_sponsorships_payment_status 
        ON golf_sponsorships(payment_status);

        -- Create golf_donations table
        CREATE TABLE IF NOT EXISTS golf_donations (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          donor_name VARCHAR(255) NOT NULL,
          donor_email VARCHAR(255) NOT NULL,
          donor_phone VARCHAR(50),
          amount DECIMAL(10,2) NOT NULL,
          message TEXT,
          is_anonymous BOOLEAN DEFAULT false,
          payment_status VARCHAR(50) DEFAULT 'pending',
          payment_method VARCHAR(50),
          payment_date TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW()
        );

        -- Create trigger to update updated_at timestamp
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_golf_registrations_updated_at 
        BEFORE UPDATE ON golf_registrations 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        CREATE TRIGGER update_golf_sponsorships_updated_at 
        BEFORE UPDATE ON golf_sponsorships 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `
    })

    if (createTableError) {
      console.error('Error creating tables:', createTableError)
      return
    }

    console.log('✅ Golf outing tables created successfully')

    // Enable Row Level Security (RLS)
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS on all golf tables
        ALTER TABLE golf_registrations ENABLE ROW LEVEL SECURITY;
        ALTER TABLE golf_sponsorships ENABLE ROW LEVEL SECURITY;
        ALTER TABLE golf_donations ENABLE ROW LEVEL SECURITY;

        -- Create policies for public read access (for admin dashboard)
        CREATE POLICY "Enable read access for all users" ON golf_registrations
          FOR SELECT USING (true);

        CREATE POLICY "Enable insert for all users" ON golf_registrations
          FOR INSERT WITH CHECK (true);

        CREATE POLICY "Enable read access for all users" ON golf_sponsorships
          FOR SELECT USING (true);

        CREATE POLICY "Enable insert for all users" ON golf_sponsorships
          FOR INSERT WITH CHECK (true);

        CREATE POLICY "Enable read access for all users" ON golf_donations
          FOR SELECT USING (true);

        CREATE POLICY "Enable insert for all users" ON golf_donations
          FOR INSERT WITH CHECK (true);
      `
    })

    if (rlsError) {
      console.error('Error setting up RLS:', rlsError)
      return
    }

    console.log('✅ Row Level Security enabled and policies created')
    console.log('✅ Golf outing database setup complete!')

  } catch (error) {
    console.error('Setup error:', error)
  }
}

setupGolfTables()