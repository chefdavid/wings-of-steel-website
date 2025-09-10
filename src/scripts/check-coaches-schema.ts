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
  console.log('Checking coaches table schema...\n');
  
  // Try to fetch one row to see what columns exist
  const { data, error } = await supabase
    .from('coaches')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error fetching data:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('Actual columns in coaches table:');
    console.log('=====================================');
    const columns = Object.keys(data[0]);
    columns.forEach(col => {
      const value = data[0][col];
      const type = value === null ? 'null' : typeof value;
      console.log(`- ${col} (${type}): ${JSON.stringify(value)}`);
    });
    
    console.log('\n\nColumn names only:');
    console.log(columns.join(', '));
    
    console.log('\n\nSample coach data:');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('No data in table');
  }
  
  // Get count
  const { count } = await supabase
    .from('coaches')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\nTotal coaches: ${count}`);
}

checkSchema().catch(console.error);