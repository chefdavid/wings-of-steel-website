#!/usr/bin/env node

/**
 * Test tag saving directly via API to isolate the issue
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Test with service role (what should work)
const supabaseService = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test with anon key (what admin interface uses)
const supabaseAnon = createClient(supabaseUrl, anonKey);

async function testTagSaving() {
  console.log('🧪 Testing tag saving functionality');
  console.log('====================================');
  
  try {
    // First, get a player to test with
    console.log('1. 📋 Getting test player...');
    const { data: players, error: fetchError } = await supabaseAnon
      .from('players')
      .select('id, name, tags')
      .eq('name', 'Jack Ashby')
      .single();
    
    if (fetchError) {
      console.error('❌ Error fetching player:', fetchError);
      return;
    }
    
    console.log('✅ Found player:', players.name);
    console.log('📋 Current tags:', players.tags);
    
    // Test 1: Try updating with anon key (what admin interface uses)
    console.log('\n2. 🔧 Testing update with anon key (admin interface simulation)...');
    const testTags = ['Captain', 'Test Tag'];
    
    const { data: anonUpdateData, error: anonUpdateError } = await supabaseAnon
      .from('players')
      .update({ tags: testTags })
      .eq('id', players.id)
      .select();
    
    console.log('🔍 Anon update response:', { data: anonUpdateData, error: anonUpdateError });
    
    if (anonUpdateError) {
      console.error('❌ Anon key update failed:', anonUpdateError);
      console.log('🔍 This is likely the issue - RLS policy problem');
      
      // Test 2: Try with service role
      console.log('\n3. 🔧 Testing update with service role...');
      const { data: serviceUpdateData, error: serviceUpdateError } = await supabaseService
        .from('players')
        .update({ tags: testTags })
        .eq('id', players.id)
        .select();
      
      if (serviceUpdateError) {
        console.error('❌ Service role update also failed:', serviceUpdateError);
      } else {
        console.log('✅ Service role update succeeded:', serviceUpdateData);
        console.log('🔍 Issue is RLS policy - anon key cannot update players');
      }
    } else {
      console.log('✅ Anon key update succeeded:', anonUpdateData);
    }
    
    // Check current state
    console.log('\n4. 🔍 Checking final state...');
    const { data: finalState, error: finalError } = await supabaseAnon
      .from('players')
      .select('name, tags')
      .eq('id', players.id)
      .single();
    
    if (finalError) {
      console.error('❌ Error checking final state:', finalError);
    } else {
      console.log('📊 Final tags for', finalState.name + ':', finalState.tags);
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testTagSaving().catch(console.error);