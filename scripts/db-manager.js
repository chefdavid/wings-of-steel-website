#!/usr/bin/env node

/**
 * Direct Supabase Database Manager
 * This script provides direct database access for troubleshooting and data management
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Use environment variables for Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  console.error('Please copy .env.example to .env and fill in your Supabase credentials');
  process.exit(1);
}

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Wings of Steel real roster data
const REAL_ROSTER = [
  // Offense
  { name: 'Jack Ashby', age: 16, position: 'Offense', bio: 'Dedicated offensive player with excellent puck handling skills and team leadership qualities.', jersey_number: 20, tags: ['Captain'], image_url: null },
  { name: 'Logan Ashby', age: 14, position: 'Offense', bio: 'Quick and agile offensive player with a natural scoring ability and great ice vision.', jersey_number: 22, tags: [], image_url: null },
  { name: 'Andrew Carmen', age: 17, position: 'Offense', bio: 'Powerful offensive player with strong shooting accuracy and exceptional teamwork skills.', jersey_number: 49, tags: [], image_url: null },
  { name: 'Shawn Gardner', age: 15, position: 'Offense', bio: 'Energetic offensive player known for creating scoring opportunities and motivating teammates.', jersey_number: 26, tags: [], image_url: null },
  { name: 'AJ Gonzales', age: 13, position: 'Offense', bio: 'Dynamic offensive player with incredible speed and determination on the ice.', jersey_number: 8, tags: ['Assistant Captain'], image_url: null },
  { name: 'Trevor Gregoire', age: 16, position: 'Offense', bio: 'Skilled offensive player with excellent stick handling and strategic game awareness.', jersey_number: 21, tags: [], image_url: null },
  { name: 'Lucas Harrop', age: 15, position: 'Offense', bio: 'Versatile offensive player who brings consistency and reliability to every game.', jersey_number: 19, tags: [], image_url: null },
  { name: 'Mikayla Johnson', age: 14, position: 'Offense', bio: 'Talented offensive player with natural hockey instincts and strong competitive spirit.', jersey_number: 11, tags: [], image_url: null },
  { name: 'Colton Naylor', age: 17, position: 'Offense', bio: 'Strong offensive player with excellent positioning and ability to control the game pace.', jersey_number: 45, tags: [], image_url: null },
  { name: 'Zach Oxenham', age: 16, position: 'Offense', bio: 'Determined offensive player known for his work ethic and ability to perform under pressure.', jersey_number: 18, tags: [], image_url: null },

  // Defense
  { name: 'Shane Phillips', age: 15, position: 'Defense', bio: 'Solid defenseman with excellent positioning and strong defensive awareness.', jersey_number: 2, tags: [], image_url: null },
  { name: 'Colin Wiederholt', age: 16, position: 'Defense', bio: 'Reliable defenseman who excels at reading the game and supporting teammates.', jersey_number: 7, tags: [], image_url: null },

  // Goalies
  { name: 'Lily Corrigan', age: 13, position: 'Goalie', bio: 'Promising goaltender with quick reflexes and strong mental focus between the pipes. Jersey number to be determined.', jersey_number: 0, tags: ['Number TBD'], image_url: null },
  { name: 'Laurel Jastrzembski', age: 17, position: 'Goalie', bio: 'Experienced goaltender known for her calm demeanor and excellent game management.', jersey_number: 44, tags: [], image_url: null }
];

class DatabaseManager {
  constructor() {
    this.supabase = supabase;
  }

  // List all current players
  async listPlayers() {
    console.log('🔍 Fetching current players...');
    const { data, error } = await this.supabase
      .from('players')
      .select('*')
      .order('jersey_number');
    
    if (error) {
      console.error('❌ Error fetching players:', error);
      return null;
    }

    console.log('📊 Current players in database:');
    console.table(data.map(p => ({
      name: p.name,
      jersey: p.jersey_number === 0 ? 'TBD' : p.jersey_number,
      position: p.position,
      age: p.age,
      tags: p.tags?.join(', ') || 'None'
    })));

    return data;
  }

  // Clear all players
  async clearPlayers() {
    console.log('🗑️  Clearing all players...');
    const { error } = await this.supabase
      .from('players')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
    
    if (error) {
      console.error('❌ Error clearing players:', error);
      return false;
    }

    console.log('✅ All players cleared');
    return true;
  }

  // Insert real Wings of Steel roster
  async insertRealRoster() {
    console.log('📥 Inserting real Wings of Steel roster...');
    
    const { data, error } = await this.supabase
      .from('players')
      .insert(REAL_ROSTER)
      .select();
    
    if (error) {
      console.error('❌ Error inserting roster:', error);
      return false;
    }

    console.log(`✅ Successfully inserted ${data.length} players`);
    return true;
  }

  // Replace entire roster (clear + insert)
  async replaceRoster() {
    console.log('🔄 Replacing entire roster with real Wings of Steel data...');
    
    const cleared = await this.clearPlayers();
    if (!cleared) return false;

    const inserted = await this.insertRealRoster();
    if (!inserted) return false;

    console.log('✅ Roster replacement complete!');
    await this.listPlayers();
    return true;
  }

  // Add a single player
  async addPlayer(playerData) {
    console.log(`👤 Adding player: ${playerData.name}`);
    
    const { data, error } = await this.supabase
      .from('players')
      .insert([playerData])
      .select();
    
    if (error) {
      console.error('❌ Error adding player:', error);
      return false;
    }

    console.log('✅ Player added successfully');
    return data[0];
  }

  // Update a player by name
  async updatePlayer(name, updates) {
    console.log(`✏️  Updating player: ${name}`);
    
    const { data, error } = await this.supabase
      .from('players')
      .update(updates)
      .eq('name', name)
      .select();
    
    if (error) {
      console.error('❌ Error updating player:', error);
      return false;
    }

    if (data.length === 0) {
      console.log('❌ Player not found');
      return false;
    }

    console.log('✅ Player updated successfully');
    return data[0];
  }

  // Delete a player by name
  async deletePlayer(name) {
    console.log(`🗑️  Deleting player: ${name}`);
    
    const { error } = await this.supabase
      .from('players')
      .delete()
      .eq('name', name);
    
    if (error) {
      console.error('❌ Error deleting player:', error);
      return false;
    }

    console.log('✅ Player deleted successfully');
    return true;
  }

  // Test database connection
  async testConnection() {
    console.log('🔗 Testing database connection...');
    
    const { data, error } = await this.supabase
      .from('players')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }

    console.log('✅ Database connection successful');
    return true;
  }

  // Get database stats
  async getStats() {
    console.log('📈 Getting database statistics...');
    
    const { data: players, error: playersError } = await this.supabase
      .from('players')
      .select('position');
    
    if (playersError) {
      console.error('❌ Error getting stats:', playersError);
      return;
    }

    const stats = players.reduce((acc, player) => {
      acc[player.position] = (acc[player.position] || 0) + 1;
      return acc;
    }, {});

    console.log('📊 Player Statistics:');
    console.table(stats);
    console.log(`📊 Total Players: ${players.length}`);
  }
}

// CLI Interface
async function main() {
  const dbManager = new DatabaseManager();
  const command = process.argv[2];

  console.log('🏒 Wings of Steel Database Manager');
  console.log('==================================');

  switch (command) {
    case 'list':
      await dbManager.listPlayers();
      break;
    
    case 'clear':
      await dbManager.clearPlayers();
      break;
    
    case 'insert':
      await dbManager.insertRealRoster();
      break;
    
    case 'replace':
      await dbManager.replaceRoster();
      break;
    
    case 'test':
      await dbManager.testConnection();
      break;
    
    case 'stats':
      await dbManager.getStats();
      break;
    
    case 'help':
    default:
      console.log('Available commands:');
      console.log('  list     - List all current players');
      console.log('  clear    - Clear all players from database');
      console.log('  insert   - Insert real Wings of Steel roster');
      console.log('  replace  - Replace entire roster (clear + insert)');
      console.log('  test     - Test database connection');
      console.log('  stats    - Show database statistics');
      console.log('  help     - Show this help message');
      console.log('');
      console.log('Usage: node scripts/db-manager.js [command]');
      break;
  }
}

// Run if called directly
if (process.argv[1].endsWith('db-manager.js')) {
  main().catch(console.error);
}

export default DatabaseManager;