#!/usr/bin/env node

/**
 * Add the missing players that failed to be added
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const MISSING_PLAYERS = [
  { name: 'Leina Beseler', jersey_number: 0, position: 'Offense', age: 14 },
  { name: 'Autumn Donzuso', jersey_number: 0, position: 'Offense', age: 15 },
  { name: 'Colten Haas', jersey_number: 0, position: 'Offense', age: 16 }
];

async function addMissingPlayers() {
  console.log('🏒 Adding Missing Players');
  console.log('========================');
  
  for (const player of MISSING_PLAYERS) {
    console.log(`🔄 Adding ${player.name}...`);
    
    const playerData = {
      name: player.name,
      jersey_number: player.jersey_number,
      position: player.position,
      age: player.age,
      bio: `${player.name} is a dedicated player on the Wings of Steel team, bringing skill and determination to every game.`,
      tags: [],
      image_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=4682B4&color=fff&size=128&bold=true`
    };
    
    const { error } = await supabase
      .from('players')
      .insert([playerData]);
    
    if (error) {
      console.error(`❌ Error adding ${player.name}:`, error);
    } else {
      console.log(`✅ Added ${player.name} (#${player.jersey_number === 0 ? 'TBD' : player.jersey_number})`);
    }
  }
  
  // Show updated roster
  console.log('\n📊 Updated Roster:');
  const { data: players, error } = await supabase
    .from('players')
    .select('name, jersey_number, position, age')
    .order('jersey_number');
  
  if (!error && players) {
    console.table(players.map(p => ({
      name: p.name,
      jersey: p.jersey_number === 0 ? 'TBD' : p.jersey_number,
      position: p.position,
      age: p.age
    })));
  }
}

addMissingPlayers().catch(console.error);