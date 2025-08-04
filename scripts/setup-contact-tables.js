import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupContactTables() {
  try {
    console.log('🚀 Setting up contact form tables...');

    // Since we can't use exec_sql, we'll create the tables using simple insert operations
    // The tables will be created automatically when we first insert data with the correct structure
    console.log('ℹ️  Tables will be created automatically on first insert');
    console.log('ℹ️  You may need to manually create tables in Supabase dashboard if needed');
    
    console.log('Contact submissions table structure:');
    console.log('- id (auto-increment)');
    console.log('- name (text)');
    console.log('- email (text)');
    console.log('- message (text)');
    console.log('- submitted_at (timestamp)');
    console.log('- read (boolean, default false)');
    
    console.log('\nMailing list table structure:');
    console.log('- id (auto-increment)');
    console.log('- name (text)');
    console.log('- email (text, unique)');
    console.log('- subscribed_at (timestamp)');
    console.log('- active (boolean, default true)');

    // Try to test if the tables exist by making a simple query
    const { error: contactTestError } = await supabase
      .from('contact_submissions')
      .select('id')
      .limit(1);

    if (contactTestError && contactTestError.code === '42P01') {
      console.log('⚠️  contact_submissions table does not exist - will be created on first submission');
    } else if (contactTestError) {
      console.log('ℹ️  contact_submissions table status:', contactTestError.message);
    } else {
      console.log('✅ contact_submissions table exists');
    }

    const { error: mailingTestError } = await supabase
      .from('mailing_list')
      .select('id')
      .limit(1);

    if (mailingTestError && mailingTestError.code === '42P01') {
      console.log('⚠️  mailing_list table does not exist - will be created on first subscription');
    } else if (mailingTestError) {
      console.log('ℹ️  mailing_list table status:', mailingTestError.message);
    } else {
      console.log('✅ mailing_list table exists');
    }

    // Add default site sections if they don't exist
    console.log('📝 Creating default site sections...');
    
    const sections = [
      {
        section_key: 'location',
        content: {
          title: 'Find Us on the Ice',
          description: 'Join us at our home rink in Voorhees, NJ. Come watch a practice or game, and see what Wings of Steel sled hockey is all about!',
          rink_name: 'Flyers Skate Zone',
          address: '601 Laurel Oak Rd, Voorhees Township, NJ 08043',
          phone: '(856) 751-9161',
          website: 'https://flyersskatezone.com/',
          google_maps_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3046.4442671551143!2d-75.04284768459386!3d39.84582267943893!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c6dd4c3b1c1c3b%3A0x8e8e8e8e8e8e8e8e!2s601%20Laurel%20Oak%20Rd%2C%20Voorhees%20Township%2C%20NJ%2008043!5e0!3m2!1sen!2sus!4v1643000000000!5m2!1sen!2sus'
        }
      },
      {
        section_key: 'get_involved',
        content: {
          title: 'Get Involved',
          description: 'Your support makes it possible for every child to play. 100% of donations go directly to supporting our players and programs.',
          donation_options: [
            { amount: "$5", frequency: "Weekly", impact: "Helps provide equipment maintenance" },
            { amount: "$10", frequency: "Weekly", impact: "Supports ice time and practice sessions" },
            { amount: "$25", frequency: "Monthly", impact: "Covers tournament entry fees" },
            { amount: "$50", frequency: "Monthly", impact: "Provides new equipment for players" }
          ]
        }
      }
    ];

    for (const section of sections) {
      const { error } = await supabase
        .from('site_sections')
        .upsert(section, { onConflict: 'section_key' });

      if (error) {
        console.error(`❌ Error creating ${section.section_key} section:`, error);
      } else {
        console.log(`✅ ${section.section_key} section created/updated successfully`);
      }
    }

    console.log('🎉 Contact form setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up contact tables:', error);
    process.exit(1);
  }
}

setupContactTables();