#!/usr/bin/env node

/**
 * Update current roster based on the new player list
 * This script will update existing players and add new ones
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Current active roster from user input
const CURRENT_ROSTER = [
  { name: 'Jack Ashby', jersey_number: 20, position: 'Offense', age: 16 },
  { name: 'Logan Ashby', jersey_number: 22, position: 'Offense', age: 14 },
  { name: 'Leina Beseler', jersey_number: 0, position: 'Offense', age: 14 }, // New player, position assumed
  { name: 'Andrew Carmen', jersey_number: 49, position: 'Offense', age: 17 },
  { name: 'Lily Corrigan', jersey_number: 0, position: 'Goalie', age: 13 }, // TBD jersey
  { name: 'Autumn Donzuso', jersey_number: 0, position: 'Offense', age: 15 }, // New player, position assumed
  { name: 'AJ Gonzales', jersey_number: 8, position: 'Offense', age: 13 },
  { name: 'Trevor Gregoire', jersey_number: 21, position: 'Offense', age: 16 },
  { name: 'Colten Haas', jersey_number: 0, position: 'Offense', age: 16 }, // New player, position assumed
  { name: 'Laurel Jastrzembski', jersey_number: 44, position: 'Goalie', age: 17 },
  { name: 'Mikayla Johnson', jersey_number: 11, position: 'Offense', age: 14 },
  { name: 'Colton Naylor', jersey_number: 45, position: 'Offense', age: 17 },
  { name: 'Shane Philipps', jersey_number: 2, position: 'Defense', age: 15 }, // Note: Philipps vs Phillips
  { name: 'Colin Wiederholt', jersey_number: 7, position: 'Defense', age: 16 }
];

async function getCurrentPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('❌ Error fetching current players:', error);
    return null;
  }
  
  return data || [];
}

async function updateRoster() {
  console.log('🏒 Wings of Steel Roster Update');
  console.log('===============================');
  
  // Get current players
  const currentPlayers = await getCurrentPlayers();
  if (!currentPlayers) return;
  
  console.log(`📊 Current database has ${currentPlayers.length} players`);
  console.log(`🎯 Target roster has ${CURRENT_ROSTER.length} players`);
  
  const updatedPlayers = [];
  const addedPlayers = [];
  
  // Process each player in the new roster
  for (const newPlayer of CURRENT_ROSTER) {
    console.log(`\n🔄 Processing ${newPlayer.name}...`);
    
    // Find existing player (check for name variations)
    let existingPlayer = currentPlayers.find(p => 
      p.name === newPlayer.name ||
      p.name === newPlayer.name.replace('Philipps', 'Phillips') // Handle name variation
    );
    
    if (existingPlayer) {
      // Update existing player
      const updates = {
        name: newPlayer.name, // Update name if there was a variation
        jersey_number: newPlayer.jersey_number,
        position: newPlayer.position,
        age: newPlayer.age
      };
      
      const { error: updateError } = await supabase
        .from('players')
        .update(updates)
        .eq('id', existingPlayer.id);
      
      if (updateError) {
        console.error(`❌ Error updating ${newPlayer.name}:`, updateError);
      } else {
        console.log(`✅ Updated ${newPlayer.name} (#${newPlayer.jersey_number === 0 ? 'TBD' : newPlayer.jersey_number})`);
        updatedPlayers.push(newPlayer.name);
      }
    } else {
      // Add new player
      const playerData = {
        name: newPlayer.name,
        jersey_number: newPlayer.jersey_number,
        position: newPlayer.position,
        age: newPlayer.age,
        bio: `${newPlayer.name} is a dedicated player on the Wings of Steel team, bringing skill and determination to every game.`,
        tags: [],
        image_url: null
      };
      
      const { error: insertError } = await supabase
        .from('players')
        .insert([playerData]);
      
      if (insertError) {
        console.error(`❌ Error adding ${newPlayer.name}:`, insertError);
      } else {
        console.log(`✅ Added ${newPlayer.name} (#${newPlayer.jersey_number === 0 ? 'TBD' : newPlayer.jersey_number})`);
        addedPlayers.push(newPlayer.name);
      }
    }
  }
  
  // Show summary
  console.log('\n📈 ROSTER UPDATE SUMMARY:');
  console.log(`✅ Updated players: ${updatedPlayers.length}`);
  console.log(`🆕 Added players: ${addedPlayers.length}`);
  
  if (updatedPlayers.length > 0) {
    console.log('\n🔄 Updated players:');
    updatedPlayers.forEach(name => console.log(`  - ${name}`));
  }
  
  if (addedPlayers.length > 0) {
    console.log('\n🆕 Added players:');
    addedPlayers.forEach(name => console.log(`  - ${name}`));
  }
  
  // Find players not in the new roster (will remain in database for historical purposes)
  const currentRosterNames = CURRENT_ROSTER.map(p => p.name);
  const inactivePlayers = currentPlayers.filter(p => 
    !currentRosterNames.includes(p.name) &&
    !currentRosterNames.includes(p.name.replace('Phillips', 'Philipps'))
  );
  
  if (inactivePlayers.length > 0) {
    console.log('\n📝 Players not in current roster (kept in database):');
    inactivePlayers.forEach(p => console.log(`  - ${p.name} (#${p.jersey_number})`));
    console.log('   These players are kept for historical records.');
  }
}

async function showFinalRoster() {
  console.log('\n📊 FINAL ROSTER STATUS:');
  console.log('=======================');
  
  const { data: allPlayers, error } = await supabase
    .from('players')
    .select('name, jersey_number, position, age')
    .order('jersey_number');
  
  if (error) {
    console.error('❌ Error fetching final roster:', error);
    return;
  }
  
  const currentRosterNames = CURRENT_ROSTER.map(p => p.name);
  const activePlayers = allPlayers.filter(p => 
    currentRosterNames.includes(p.name) ||
    currentRosterNames.includes(p.name.replace('Phillips', 'Philipps'))
  );
  
  console.log('\n🟢 CURRENT ACTIVE ROSTER:');
  console.table(activePlayers.map(p => ({
    name: p.name,
    jersey: p.jersey_number === 0 ? 'TBD' : p.jersey_number,
    position: p.position,
    age: p.age
  })));
  
  const inactivePlayers = allPlayers.filter(p => 
    !currentRosterNames.includes(p.name) &&
    !currentRosterNames.includes(p.name.replace('Phillips', 'Philipps'))
  );
  
  if (inactivePlayers.length > 0) {
    console.log('\n📋 HISTORICAL PLAYERS (not in current roster):');
    console.table(inactivePlayers.map(p => ({
      name: p.name,
      jersey: p.jersey_number === 0 ? 'TBD' : p.jersey_number,
      position: p.position,
      age: p.age
    })));
  }
  
  console.log(`\n✅ Current roster: ${activePlayers.length} players`);
  console.log(`📚 Historical players: ${inactivePlayers.length} players`);
  console.log(`📊 Total database: ${allPlayers.length} players`);
}

// Run the update
updateRoster()
  .then(() => showFinalRoster())
  .then(() => {
    console.log('\n🎉 Roster update completed successfully!');
    console.log('🌐 The website will now display the updated roster.');
  })
  .catch(console.error);