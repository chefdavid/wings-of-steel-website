import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Script to check the actual schema of game_schedules table
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('Checking game_schedules table schema...\n');
  
  // Try to fetch one row to see what columns exist
  const { data, error } = await supabase
    .from('game_schedules')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error fetching data:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('Actual columns in game_schedules table:');
    console.log('=====================================');
    const columns = Object.keys(data[0]);
    columns.forEach(col => {
      const value = data[0][col];
      const type = value === null ? 'null' : typeof value;
      console.log(`- ${col} (${type}): ${JSON.stringify(value)}`);
    });
    
    console.log('\n\nColumn names only:');
    console.log(columns.join(', '));
  } else {
    console.log('No data in table. Let me try to insert a test row to discover schema...');
    
    // Try minimal insert
    const testData = {
      game_date: '2025-01-01',
      game_time: '12:00',
      opponent: 'Test Team',
      location: 'Test Location',
      home_away: 'home'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('game_schedules')
      .insert([testData])
      .select();
    
    if (insertError) {
      console.log('Insert error (this helps show what columns exist):');
      console.log(insertError);
    } else if (insertData) {
      console.log('Successfully inserted test data. Columns:');
      console.log(Object.keys(insertData[0]));
      
      // Clean up test data
      await supabase
        .from('game_schedules')
        .delete()
        .eq('opponent', 'Test Team');
    }
  }
}

checkSchema().catch(console.error);