#!/usr/bin/env node

/**
 * Insert coaches data into the coaches table
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

async function insertCoaches() {
  console.log('👥 Inserting coaches data');
  console.log('=========================');
  
  try {
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

    console.log('📥 Inserting 4 coaches...');
    const { data, error } = await supabase
      .from('coaches')
      .insert(coachData)
      .select();

    if (error) {
      console.error('❌ Insert error:', error);
      return;
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

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

insertCoaches().catch(console.error);