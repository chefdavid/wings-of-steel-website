import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createEventRegistrationsTable() {
  try {
    console.log('Creating event_registrations table...');

    // Create the table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS event_registrations (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          event_name TEXT NOT NULL,
          event_date DATE,

          -- Customer Information
          customer_name TEXT NOT NULL,
          customer_email TEXT NOT NULL,
          customer_phone TEXT,
          customer_company TEXT,
          team_members TEXT,
          special_requests TEXT,

          -- Order Details
          package_name TEXT,
          package_price INTEGER,
          addons JSONB DEFAULT '[]'::jsonb,
          donation_amount INTEGER DEFAULT 0,
          subtotal INTEGER,
          total_amount INTEGER NOT NULL,

          -- Payment Information
          payment_intent_id TEXT UNIQUE,
          payment_status TEXT DEFAULT 'pending',
          payment_method TEXT,

          -- Metadata
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),

          -- Indexes
          INDEX idx_event_name (event_name),
          INDEX idx_payment_intent (payment_intent_id),
          INDEX idx_customer_email (customer_email),
          INDEX idx_created_at (created_at)
        );
      `
    }).catch(async () => {
      // If exec_sql doesn't exist, try direct query
      console.log('Using alternative method to create table...');

      const { error } = await supabase
        .from('event_registrations')
        .select('id')
        .limit(1);

      if (error && error.message.includes('does not exist')) {
        console.log('Table does not exist. Please create it manually in Supabase dashboard with this SQL:');
        console.log(`
CREATE TABLE event_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_date DATE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_company TEXT,
  team_members TEXT,
  special_requests TEXT,
  package_name TEXT,
  package_price INTEGER,
  addons JSONB DEFAULT '[]'::jsonb,
  donation_amount INTEGER DEFAULT 0,
  subtotal INTEGER,
  total_amount INTEGER NOT NULL,
  payment_intent_id TEXT UNIQUE,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_event_name ON event_registrations(event_name);
CREATE INDEX idx_payment_intent ON event_registrations(payment_intent_id);
CREATE INDEX idx_customer_email ON event_registrations(customer_email);
CREATE INDEX idx_created_at ON event_registrations(created_at);
        `);
        return false;
      } else if (!error) {
        console.log('Table already exists!');
        return true;
      }
    });

    if (createError) {
      console.error('Error creating table:', createError);
      return false;
    }

    console.log('✅ Table created successfully!');

    // Create a view for dashboard analytics
    const { error: viewError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE VIEW event_registrations_summary AS
        SELECT
          event_name,
          COUNT(*) as total_registrations,
          COUNT(DISTINCT customer_email) as unique_customers,
          SUM(total_amount) / 100.0 as total_revenue,
          AVG(total_amount) / 100.0 as average_order,
          SUM(donation_amount) / 100.0 as total_donations,
          MAX(created_at) as last_registration,
          MIN(created_at) as first_registration
        FROM event_registrations
        WHERE payment_status = 'completed'
        GROUP BY event_name;
      `
    }).catch(() => {
      console.log('Could not create view. You may need to create it manually.');
    });

    if (viewError) {
      console.log('Warning: Could not create summary view:', viewError.message);
    } else {
      console.log('✅ Summary view created!');
    }

    // Test the table with a sample insert
    const { data, error: insertError } = await supabase
      .from('event_registrations')
      .insert({
        event_name: 'TEST - Delete Me',
        event_date: '2024-10-26',
        customer_name: 'Test User',
        customer_email: 'test@example.com',
        package_name: 'Test Package',
        total_amount: 15000,
        payment_status: 'test'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error testing insert:', insertError);
    } else {
      console.log('✅ Test insert successful!');

      // Delete the test record
      const { error: deleteError } = await supabase
        .from('event_registrations')
        .delete()
        .eq('id', data.id);

      if (!deleteError) {
        console.log('✅ Test record cleaned up!');
      }
    }

    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

// Run the script
createEventRegistrationsTable().then(success => {
  if (success) {
    console.log('\n✅ Event registrations table is ready!');
    console.log('You can now start accepting Pizza, Pins & Pop registrations.');
  } else {
    console.log('\n⚠️ Table setup incomplete. Please check the errors above.');
  }
  process.exit(success ? 0 : 1);
});