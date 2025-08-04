#!/usr/bin/env node

/**
 * Check all database tables and their contents
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

async function checkAllTables() {
  console.log('🔍 Checking all database tables');
  console.log('================================');
  console.log(`📡 Database: ${supabaseUrl}`);
  console.log('');
  
  try {
    // Check players table
    console.log('1. 📊 Players table:');
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*', { count: 'exact' });
    
    if (playersError) {
      console.error('❌ Players table error:', playersError);
    } else {
      console.log(`✅ Found ${players.length} players`);
    }
    
    // Check site_sections table
    console.log('\n2. 📄 Site sections table:');
    const { data: sections, error: sectionsError } = await supabase
      .from('site_sections')
      .select('*', { count: 'exact' });
    
    if (sectionsError) {
      console.error('❌ Site sections table error:', sectionsError);
      console.log('🔧 This table may need to be created');
    } else {
      console.log(`✅ Found ${sections.length} site sections`);
      if (sections.length > 0) {
        console.log('📋 Section keys:', sections.map(s => s.section_key).join(', '));
      }
    }
    
    // Check game_schedule table
    console.log('\n3. 🏒 Game schedule table:');
    const { data: games, error: gamesError } = await supabase
      .from('game_schedule')
      .select('*', { count: 'exact' });
    
    if (gamesError) {
      console.error('❌ Game schedule table error:', gamesError);
      console.log('🔧 This table may need to be created');
    } else {
      console.log(`✅ Found ${games.length} games`);
    }
    
    // Check coaches table
    console.log('\n4. 👥 Coaches table:');
    const { data: coaches, error: coachesError } = await supabase
      .from('coaches')
      .select('*', { count: 'exact' });
    
    if (coachesError) {
      console.error('❌ Coaches table error:', coachesError);
      console.log('🔧 This table may need to be created');
    } else {
      console.log(`✅ Found ${coaches.length} coaches`);
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkAllTables().catch(console.error);