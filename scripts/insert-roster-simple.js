#!/usr/bin/env node

/**
 * Insert Wings of Steel roster without tags column
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function insertRoster() {
  console.log('🏒 Inserting Wings of Steel Roster');
  console.log('==================================');
  
  try {
    // Clear existing players first
    console.log('🗑️ Clearing existing players...');
    const { error: deleteError } = await supabase
      .from('players')
      .delete()
      .gte('jersey_number', 0);

    if (deleteError) {
      console.error('❌ Delete error:', deleteError);
      return;
    }
    console.log('✅ Existing players cleared');

    // Insert roster without tags column (using empty string for image_url)
    const realRoster = [
      { name: 'Lily Corrigan', age: 13, position: 'Goalie', bio: 'Promising goaltender with quick reflexes and strong mental focus between the pipes. Jersey number to be determined.', jersey_number: 0, image_url: '' },
      { name: 'Shane Phillips', age: 15, position: 'Defense', bio: 'Solid defenseman with excellent positioning and strong defensive awareness.', jersey_number: 2, image_url: '' },
      { name: 'Colin Wiederholt', age: 16, position: 'Defense', bio: 'Reliable defenseman who excels at reading the game and supporting teammates.', jersey_number: 7, image_url: '' },
      { name: 'AJ Gonzales', age: 13, position: 'Forward', bio: 'Dynamic forward with incredible speed and determination on the ice.', jersey_number: 8, image_url: '' },
      { name: 'Mikayla Johnson', age: 14, position: 'Forward', bio: 'Talented forward with natural hockey instincts and strong competitive spirit.', jersey_number: 11, image_url: '' },
      { name: 'Zach Oxenham', age: 16, position: 'Forward', bio: 'Determined forward known for his work ethic and ability to perform under pressure.', jersey_number: 18, image_url: '' },
      { name: 'Lucas Harrop', age: 15, position: 'Forward', bio: 'Versatile forward who brings consistency and reliability to every game.', jersey_number: 19, image_url: '' },
      { name: 'Jack Ashby', age: 16, position: 'Forward', bio: 'Dedicated forward with excellent puck handling skills and team leadership qualities.', jersey_number: 20, image_url: '' },
      { name: 'Trevor Gregoire', age: 16, position: 'Forward', bio: 'Skilled forward with excellent stick handling and strategic game awareness.', jersey_number: 21, image_url: '' },
      { name: 'Logan Ashby', age: 14, position: 'Forward', bio: 'Quick and agile forward with a natural scoring ability and great ice vision.', jersey_number: 22, image_url: '' },
      { name: 'Shawn Gardner', age: 15, position: 'Forward', bio: 'Energetic forward known for creating scoring opportunities and motivating teammates.', jersey_number: 26, image_url: '' },
      { name: 'Laurel Jastrzembski', age: 17, position: 'Goalie', bio: 'Experienced goaltender known for her calm demeanor and excellent game management.', jersey_number: 44, image_url: '' },
      { name: 'Colton Naylor', age: 17, position: 'Forward', bio: 'Strong forward with excellent positioning and ability to control the game pace.', jersey_number: 45, image_url: '' },
      { name: 'Andrew Carmen', age: 17, position: 'Forward', bio: 'Powerful forward with strong shooting accuracy and exceptional teamwork skills.', jersey_number: 49, image_url: '' }
    ];

    console.log('📥 Inserting Wings of Steel roster...');
    const { data: insertedPlayers, error: insertError } = await supabase
      .from('players')
      .insert(realRoster)
      .select();

    if (insertError) {
      console.error('❌ Insert error:', insertError);
      return;
    }

    console.log(`✅ Successfully inserted ${insertedPlayers.length} players`);
    
    // Verify
    const { data: verifyPlayers, error: verifyError } = await supabase
      .from('players')
      .select('name, jersey_number, position')
      .order('jersey_number');

    if (verifyError) {
      console.error('❌ Verify error:', verifyError);
      return;
    }

    console.log('');
    console.log('✅ Wings of Steel roster now in hosted database:');
    console.table(verifyPlayers);
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

insertRoster().catch(console.error);