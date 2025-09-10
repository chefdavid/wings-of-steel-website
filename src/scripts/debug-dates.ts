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

async function debugDates() {
  const now = new Date();
  console.log('Current date/time:', now.toISOString());
  console.log('Local:', now.toString());
  console.log('');
  
  const { data: games, error } = await supabase
    .from('game_schedules')
    .select('*')
    .order('game_date', { ascending: true });
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`Total games: ${games?.length || 0}\n`);
  
  const past: any[] = [];
  const upcoming: any[] = [];
  
  games?.forEach(game => {
    const gameDate = game.game_date || game.date;
    const gameDateObj = new Date(gameDate);
    
    console.log(`Game: ${gameDate} ${game.game_time} vs ${game.opponent}`);
    console.log(`  Parsed date: ${gameDateObj}`);
    console.log(`  Is past? ${gameDateObj < now} (${gameDateObj.getTime()} < ${now.getTime()})`);
    console.log('');
    
    if (gameDateObj < now) {
      past.push(game);
    } else {
      upcoming.push(game);
    }
  });
  
  console.log(`\nPast games: ${past.length}`);
  console.log(`Upcoming games: ${upcoming.length}`);
  
  if (upcoming.length > 0) {
    console.log('\nNext game:');
    const next = upcoming[0];
    console.log(`  ${next.game_date} ${next.game_time} vs ${next.opponent} (${next.home_away})`);
  }
}

debugDates().catch(console.error);