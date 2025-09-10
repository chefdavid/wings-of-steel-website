import { createClient } from '@supabase/supabase-js';
import { schedule2025_2026 } from '../data/schedule-2025-2026';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Script to import 2025-2026 schedule into Supabase
// Run with: npx tsx src/scripts/import-schedule.ts

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearExistingSchedule() {
  console.log('Clearing existing 2025-2026 schedule...');
  
  const { error } = await supabase
    .from('game_schedules')
    .delete()
    .gte('game_date', '2025-10-01')
    .lte('game_date', '2026-05-31');
  
  if (error) {
    console.error('Error clearing schedule:', error);
    return false;
  }
  
  console.log('Existing schedule cleared');
  return true;
}

async function importSchedule() {
  console.log('Starting schedule import...');
  
  // First clear existing 2025-2026 games
  const cleared = await clearExistingSchedule();
  if (!cleared) {
    console.error('Failed to clear existing schedule');
    return;
  }
  
  // Map the data to match the actual database schema
  const gamesToInsert = schedule2025_2026.map(game => ({
    game_date: game.game_date,
    game_time: game.game_time,
    opponent: game.opponent,
    location: game.location,
    home_away: game.home_away,
    notes: game.notes || null,
    season: game.season,
    is_active: true
  }));
  
  console.log(`Importing ${gamesToInsert.length} games...`);
  
  // Insert in batches of 5 to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < gamesToInsert.length; i += batchSize) {
    const batch = gamesToInsert.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('game_schedules')
      .insert(batch)
      .select();
    
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
    } else {
      console.log(`Batch ${i / batchSize + 1} inserted:`, data?.length, 'games');
    }
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('Schedule import complete!');
  
  // Verify the import
  const { data: verifyData, error: verifyError } = await supabase
    .from('game_schedules')
    .select('*')
    .gte('game_date', '2025-10-01')
    .lte('game_date', '2026-05-31')
    .order('game_date', { ascending: true });
  
  if (verifyError) {
    console.error('Error verifying import:', verifyError);
  } else {
    console.log(`\nVerification: ${verifyData?.length} games in database for 2025-2026 season`);
    
    // Show first few games
    console.log('\nFirst 3 games:');
    verifyData?.slice(0, 3).forEach(game => {
      const date = new Date(game.game_date);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
      console.log(`- ${dayOfWeek} ${game.game_date} ${game.game_time} vs ${game.opponent} (${game.home_away})`);
    });
  }
}

// Run the import
importSchedule().catch(console.error);