#!/usr/bin/env node

/**
 * Debug what Supabase Studio sees
 * Uses the exact same connection as Studio
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Use the actual hosted Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zfiqvovfhkqiucmuwykw.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmaXF2b3ZmaGtxaXVjbXV3eWt3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA3ODcyMSwiZXhwIjoyMDY1NjU0NzIxfQ.SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function debugStudio() {
  console.log('🔍 Debugging Supabase Studio Connection');
  console.log('=====================================');
  console.log('URL:', supabaseUrl);
  console.log('Studio URL: https://supabase.com/dashboard/project/zfiqvovfhkqiucmuwykw');
  console.log('');

  try {
  // Test connection
  const { data: players, error } = await supabase
    .from('players')
    .select('name, jersey_number, position')
    .order('jersey_number');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('📊 Players via Supabase API (what Studio should see):');
  console.table(players);

  // Now force clear and insert via API
  console.log('');
  console.log('🔄 Clearing players via API...');
  const { error: deleteError } = await supabase
    .from('players')
    .delete()
    .gte('jersey_number', 0);

  if (deleteError) {
    console.error('❌ Delete error:', deleteError);
    return;
  }

  console.log('✅ Players cleared via API');

  // Insert real roster via API
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

  console.log('📥 Inserting real roster via API...');
  const { data: insertedPlayers, error: insertError } = await supabase
    .from('players')
    .insert(realRoster)
    .select();

  if (insertError) {
    console.error('❌ Insert error:', insertError);
    return;
  }

  console.log(`✅ Inserted ${insertedPlayers.length} players via API`);

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
  console.log('✅ Final verification - Players now in database:');
  console.table(verifyPlayers);
  console.log('');
  console.log('🔄 Please refresh Supabase Studio at: https://supabase.com/dashboard/project/zfiqvovfhkqiucmuwykw');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

debugStudio().catch(console.error);