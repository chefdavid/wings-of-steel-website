#!/usr/bin/env node

/**
 * Fix hosted database schema to match local development
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

async function fixSchema() {
  console.log('🔧 Fixing hosted database schema...');
  console.log('=====================================');
  
  try {
    // Add tags column if it doesn't exist
    console.log('📝 Adding tags column to players table...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'players' AND column_name = 'tags'
          ) THEN
            ALTER TABLE players ADD COLUMN tags TEXT[] DEFAULT '{}';
          END IF;
        END $$;
      `
    });

    if (error) {
      console.log('⚠️ RPC method not available, trying direct SQL...');
      
      // Try a simple insert approach to test if tags column exists
      const testRoster = [{
        name: 'Test Player',
        age: 16,
        position: 'Forward', 
        bio: 'Test bio',
        jersey_number: 999,
        image_url: null,
        tags: []
      }];
      
      const { error: testError } = await supabase
        .from('players')
        .insert(testRoster);
        
      if (testError && testError.message.includes('tags')) {
        console.log('❌ Tags column missing and cannot be added automatically');
        console.log('📋 Please run this SQL in your Supabase SQL editor:');
        console.log('ALTER TABLE players ADD COLUMN tags TEXT[] DEFAULT \'{}\';');
        return;
      } else if (!testError) {
        // Clean up test record
        await supabase.from('players').delete().eq('jersey_number', 999);
        console.log('✅ Tags column exists or was added successfully');
      }
    } else {
      console.log('✅ Schema updated successfully');
    }

    // Now insert the roster
    console.log('📥 Inserting Wings of Steel roster...');
    
    const realRoster = [
      { name: 'Lily Corrigan', age: 13, position: 'Goalie', bio: 'Promising goaltender with quick reflexes and strong mental focus between the pipes. Jersey number to be determined.', jersey_number: 0, tags: ['Number TBD'], image_url: null },
      { name: 'Shane Phillips', age: 15, position: 'Defense', bio: 'Solid defenseman with excellent positioning and strong defensive awareness.', jersey_number: 2, tags: [], image_url: null },
      { name: 'Colin Wiederholt', age: 16, position: 'Defense', bio: 'Reliable defenseman who excels at reading the game and supporting teammates.', jersey_number: 7, tags: [], image_url: null },
      { name: 'AJ Gonzales', age: 13, position: 'Forward', bio: 'Dynamic forward with incredible speed and determination on the ice.', jersey_number: 8, tags: ['Assistant Captain'], image_url: null },
      { name: 'Mikayla Johnson', age: 14, position: 'Forward', bio: 'Talented forward with natural hockey instincts and strong competitive spirit.', jersey_number: 11, tags: [], image_url: null },
      { name: 'Zach Oxenham', age: 16, position: 'Forward', bio: 'Determined forward known for his work ethic and ability to perform under pressure.', jersey_number: 18, tags: [], image_url: null },
      { name: 'Lucas Harrop', age: 15, position: 'Forward', bio: 'Versatile forward who brings consistency and reliability to every game.', jersey_number: 19, tags: [], image_url: null },
      { name: 'Jack Ashby', age: 16, position: 'Forward', bio: 'Dedicated forward with excellent puck handling skills and team leadership qualities.', jersey_number: 20, tags: ['Captain'], image_url: null },
      { name: 'Trevor Gregoire', age: 16, position: 'Forward', bio: 'Skilled forward with excellent stick handling and strategic game awareness.', jersey_number: 21, tags: [], image_url: null },
      { name: 'Logan Ashby', age: 14, position: 'Forward', bio: 'Quick and agile forward with a natural scoring ability and great ice vision.', jersey_number: 22, tags: [], image_url: null },
      { name: 'Shawn Gardner', age: 15, position: 'Forward', bio: 'Energetic forward known for creating scoring opportunities and motivating teammates.', jersey_number: 26, tags: [], image_url: null },
      { name: 'Laurel Jastrzembski', age: 17, position: 'Goalie', bio: 'Experienced goaltender known for her calm demeanor and excellent game management.', jersey_number: 44, tags: [], image_url: null },
      { name: 'Colton Naylor', age: 17, position: 'Forward', bio: 'Strong forward with excellent positioning and ability to control the game pace.', jersey_number: 45, tags: [], image_url: null },
      { name: 'Andrew Carmen', age: 17, position: 'Forward', bio: 'Powerful forward with strong shooting accuracy and exceptional teamwork skills.', jersey_number: 49, tags: [], image_url: null }
    ];

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
    console.log('✅ Final verification - Players now in hosted database:');
    console.table(verifyPlayers);
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

fixSchema().catch(console.error);