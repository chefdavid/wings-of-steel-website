#!/usr/bin/env node

/**
 * Frontend Debugging Tool
 * Helps debug React app issues by testing the same API calls the frontend makes
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Use environment variables for Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables');
  console.error('Please copy .env.example to .env and fill in your Supabase credentials');
  process.exit(1);
}

// Create the same client the React app uses
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugFrontend() {
  console.log('🔍 Debugging Frontend Data Access');
  console.log('=================================');
  console.log(`📡 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Using anon key: ${supabaseAnonKey.substring(0, 20)}...`);
  console.log('');

  try {
    // Test the exact same query the React app makes
    console.log('🚀 Testing React app query: supabase.from("players").select("*").order("jersey_number")');
    
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('jersey_number', { ascending: true });

    if (error) {
      console.error('❌ Error (same as React app would see):', error);
      console.log('');
      console.log('🔧 Troubleshooting tips:');
      console.log('1. Check if Supabase is running: npm run db:test');
      console.log('2. Verify RLS policies allow public read access');
      console.log('3. Check browser console for CORS errors');
      return;
    }

    if (!data || data.length === 0) {
      console.log('⚠️  No players found - this is what React app sees');
      console.log('');
      console.log('🔧 Try: npm run db:list to see server-side data');
      return;
    }

    console.log(`✅ Found ${data.length} players (React app should see this data)`);
    console.log('');
    console.log('📊 Players that React app receives:');
    console.table(data.map(p => ({
      name: p.name,
      jersey: p.jersey_number === 0 ? 'TBD' : p.jersey_number,
      position: p.position,
      age: p.age,
      tags: p.tags?.join(', ') || 'None',
      has_image: p.image_url ? 'Yes' : 'No'
    })));

    console.log('');
    console.log('🔧 If React app still shows old data:');
    console.log('1. Hard refresh browser (Ctrl+F5)');
    console.log('2. Clear browser cache for localhost');
    console.log('3. Check browser Network tab for failed requests');
    console.log('4. Restart dev server on new port');

  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

// Run the debug
debugFrontend().catch(console.error);