import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGames() {
  console.log('Checking games in database...\n');
  
  // Count total games
  const { count, error: countError } = await supabase
    .from('game_schedules')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.error('Error counting games:', countError);
    return;
  }
  
  console.log(`Total games in database: ${count}\n`);
  
  // Get all games for 2025-2026 season
  const { data: seasonGames, error: seasonError } = await supabase
    .from('game_schedules')
    .select('*')
    .eq('season', '2025-2026')
    .order('game_date', { ascending: true });
  
  if (seasonError) {
    console.error('Error fetching season games:', seasonError);
  } else {
    console.log(`2025-2026 season games: ${seasonGames?.length || 0}`);
    if (seasonGames && seasonGames.length > 0) {
      console.log('\nFirst few games:');
      seasonGames.slice(0, 3).forEach(game => {
        console.log(`- ${game.game_date} ${game.game_time} vs ${game.opponent} (${game.home_away})`);
      });
    }
  }
  
  // Get all games (no filter)
  const { data: allGames, error: allError } = await supabase
    .from('game_schedules')
    .select('*')
    .order('game_date', { ascending: true })
    .limit(5);
  
  if (allError) {
    console.error('Error fetching all games:', allError);
  } else {
    console.log(`\nSample of all games (first 5):`);
    if (allGames && allGames.length > 0) {
      allGames.forEach(game => {
        console.log(`- ${game.game_date} ${game.game_time} vs ${game.opponent} | Season: ${game.season} | Active: ${game.is_active}`);
      });
    } else {
      console.log('No games found in database');
    }
  }
  
  // Check for games with missing required fields
  const { data: checkData, error: checkError } = await supabase
    .from('game_schedules')
    .select('*')
    .is('game_date', null);
  
  if (!checkError && checkData) {
    console.log(`\nGames with null game_date: ${checkData.length}`);
  }
}

checkGames().catch(console.error);