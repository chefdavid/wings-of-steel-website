#!/usr/bin/env node

/**
 * Add tags column to hosted Supabase database
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

async function addTagsColumn() {
  console.log('🔧 Adding tags column to hosted database');
  console.log('==========================================');
  console.log(`📡 Database: ${supabaseUrl}`);
  console.log('');
  
  try {
    // Method 1: Try using a simple test insert to see if column exists
    console.log('🔍 Testing if tags column exists...');
    
    const testPlayer = {
      name: 'Test Player',
      age: 16,
      position: 'Forward', 
      bio: 'Test bio',
      jersey_number: 999,
      image_url: '',
      tags: ['Test Tag']
    };
    
    const { error: testError } = await supabase
      .from('players')
      .insert([testPlayer]);
    
    if (testError && testError.message.includes('tags')) {
      console.log('❌ Tags column missing, need to add it manually');
      console.log('');
      console.log('📋 Please run this SQL command in your Supabase SQL Editor:');
      console.log('==========================================');
      console.log('ALTER TABLE players ADD COLUMN tags TEXT[] DEFAULT \'{}\';');
      console.log('==========================================');
      console.log('');
      console.log('After running the SQL, run this script again to verify.');
      return false;
    } else if (testError) {
      console.error('❌ Other error during test:', testError);
      return false;
    } else {
      // Clean up test record
      await supabase.from('players').delete().eq('jersey_number', 999);
      console.log('✅ Tags column already exists!');
      return true;
    }
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return false;
  }
}

async function updatePlayersWithTags() {
  console.log('🏷️ Updating players with correct tags...');
  
  const playersWithTags = [
    { name: 'Lily Corrigan', tags: ['Number TBD'] },
    { name: 'AJ Gonzales', tags: ['Assistant Captain'] },
    { name: 'Jack Ashby', tags: ['Captain'] }
  ];
  
  for (const playerUpdate of playersWithTags) {
    try {
      const { error } = await supabase
        .from('players')
        .update({ tags: playerUpdate.tags })
        .eq('name', playerUpdate.name);
      
      if (error) {
        console.error(`❌ Error updating ${playerUpdate.name}:`, error);
      } else {
        console.log(`✅ Updated ${playerUpdate.name} with tags: ${playerUpdate.tags.join(', ')}`);
      }
    } catch (error) {
      console.error(`💥 Unexpected error updating ${playerUpdate.name}:`, error);
    }
  }
}

async function verifyTags() {
  console.log('');
  console.log('🔍 Verifying tags in database...');
  
  try {
    const { data: players, error } = await supabase
      .from('players')
      .select('name, tags')
      .not('tags', 'is', null)
      .order('name');
    
    if (error) {
      console.error('❌ Error fetching players:', error);
      return;
    }
    
    if (players && players.length > 0) {
      console.log('✅ Players with tags:');
      console.table(players.map(p => ({
        name: p.name,
        tags: p.tags?.join(', ') || 'None'
      })));
    } else {
      console.log('ℹ️ No players with tags found (this is normal if you just added the column)');
    }
  } catch (error) {
    console.error('💥 Error verifying tags:', error);
  }
}

async function main() {
  const columnExists = await addTagsColumn();
  
  if (columnExists) {
    await updatePlayersWithTags();
    await verifyTags();
    console.log('');
    console.log('🎉 Tags functionality ready!');
    console.log('You can now use the admin interface to add/edit player tags.');
  }
}

main().catch(console.error);