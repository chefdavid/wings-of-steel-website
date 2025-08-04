#!/usr/bin/env node

/**
 * Create coaches table and populate with initial data
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

async function createCoachesTable() {
  console.log('🔧 Creating coaches table and adding initial data');
  console.log('=================================================');
  
  try {
    // First, insert the coach data (table will be created automatically if needed)
    const coachData = [
      {
        name: "Norm Jones",
        role: "Head Coach",
        description: "Experienced head coach leading the Wings of Steel with dedication and expertise",
        experience: "Veteran sled hockey coach",
        achievements: ["Head Coach - Wings of Steel", "Youth Development Specialist", "Adaptive Sports Leader"],
        image_url: ""
      },
      {
        name: "Rico Gonzales",
        role: "Assistant Coach", 
        description: "Dedicated assistant coach focused on player development and team strategy",
        experience: "Assistant coaching experience",
        achievements: ["Assistant Coach - Wings of Steel", "Player Development", "Team Strategy Coordinator"],
        image_url: ""
      },
      {
        name: "Garret Goebel",
        role: "Assistant Coach",
        description: "Passionate assistant coach committed to helping players reach their potential", 
        experience: "Assistant coaching experience",
        achievements: ["Assistant Coach - Wings of Steel", "Skills Development", "Team Mentorship"],
        image_url: ""
      },
      {
        name: "Stephen Belcher",
        role: "Assistant Coach",
        description: "Supportive assistant coach focused on building team chemistry and individual skills",
        experience: "Assistant coaching experience", 
        achievements: ["Assistant Coach - Wings of Steel", "Team Building", "Individual Skills Training"],
        image_url: ""
      }
    ];

    console.log('📥 Inserting coaches data...');
    const { data, error } = await supabase
      .from('coaches')
      .insert(coachData)
      .select();

    if (error) {
      console.log('ℹ️ Table may not exist, will need to be created manually');
      console.log('');
      console.log('📋 Please run this SQL in your Supabase SQL Editor:');
      console.log('==========================================');
      console.log(`
CREATE TABLE coaches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    description TEXT NOT NULL,
    experience TEXT,
    achievements TEXT[] DEFAULT '{}',
    image_url TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert initial coach data
INSERT INTO coaches (name, role, description, experience, achievements, image_url) VALUES
('Norm Jones', 'Head Coach', 'Experienced head coach leading the Wings of Steel with dedication and expertise', 'Veteran sled hockey coach', '{"Head Coach - Wings of Steel", "Youth Development Specialist", "Adaptive Sports Leader"}', ''),
('Rico Gonzales', 'Assistant Coach', 'Dedicated assistant coach focused on player development and team strategy', 'Assistant coaching experience', '{"Assistant Coach - Wings of Steel", "Player Development", "Team Strategy Coordinator"}', ''),
('Garret Goebel', 'Assistant Coach', 'Passionate assistant coach committed to helping players reach their potential', 'Assistant coaching experience', '{"Assistant Coach - Wings of Steel", "Skills Development", "Team Mentorship"}', ''),
('Stephen Belcher', 'Assistant Coach', 'Supportive assistant coach focused on building team chemistry and individual skills', 'Assistant coaching experience', '{"Assistant Coach - Wings of Steel", "Team Building", "Individual Skills Training"}', '');
      `);
      console.log('==========================================');
      return false;
    }

    console.log(`✅ Successfully inserted ${data.length} coaches`);
    
    // Verify
    const { data: verifyCoaches, error: verifyError } = await supabase
      .from('coaches')
      .select('*')
      .order('name');

    if (verifyError) {
      console.error('❌ Error verifying coaches:', verifyError);
    } else {
      console.log('');
      console.log('✅ Coaches in database:');
      console.table(verifyCoaches.map(c => ({
        name: c.name,
        role: c.role,
        achievements: c.achievements?.length || 0
      })));
    }

    return true;
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return false;
  }
}

createCoachesTable().catch(console.error);