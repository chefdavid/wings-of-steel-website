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

async function checkSchema() {
  console.log('Checking practice_schedules table schema...\n');
  
  // Try to fetch one row to see what columns exist
  const { data, error } = await supabase
    .from('practice_schedules')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error fetching data:', error);
    
    // Try with different column names
    console.log('\nTrying with different column names...');
    const { data: altData, error: altError } = await supabase
      .from('practice_schedules')
      .select('*')
      .limit(1);
    
    if (altError) {
      console.error('Still error:', altError);
    } else if (altData && altData.length > 0) {
      console.log('Found columns:', Object.keys(altData[0]));
    }
    
    return;
  }
  
  if (data && data.length > 0) {
    console.log('Actual columns in practice_schedules table:');
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
    console.log('No data in table');
  }
  
  // Get count
  const { count } = await supabase
    .from('practice_schedules')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\nTotal rows: ${count}`);
}

checkSchema().catch(console.error);