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

async function checkActivePractices() {
  const today = new Date().toISOString().split('T')[0];
  console.log('Checking active practices for today:', today);
  console.log('');
  
  // Check what the Location component is trying to fetch
  console.log('Query 1: What Location component is trying to fetch:');
  const { data: query1, error: error1 } = await supabase
    .from('practice_schedules')
    .select('*')
    .eq('is_active', true)
    .lte('effective_from', today)
    .gte('effective_to', today)
    .order('day_order')
    .order('start_time');
  
  if (error1) {
    console.error('Error:', error1);
  } else {
    console.log(`Found ${query1?.length || 0} practices`);
    if (query1 && query1.length > 0) {
      query1.forEach(p => {
        console.log(`- ${p.day_of_week} ${p.start_time}-${p.end_time} (${p.team_type})`);
        console.log(`  Effective: ${p.effective_from} to ${p.effective_to}`);
      });
    }
  }
  
  console.log('\n-------------------\n');
  
  // Check all active practices
  console.log('Query 2: All active practices:');
  const { data: query2, error: error2 } = await supabase
    .from('practice_schedules')
    .select('*')
    .eq('is_active', true)
    .order('day_order');
  
  if (error2) {
    console.error('Error:', error2);
  } else {
    console.log(`Found ${query2?.length || 0} active practices`);
    if (query2 && query2.length > 0) {
      query2.slice(0, 5).forEach(p => {
        console.log(`- ${p.day_of_week} ${p.start_time}-${p.end_time}`);
        console.log(`  Effective: ${p.effective_from} to ${p.effective_to}`);
        console.log(`  Active: ${p.is_active}, Team: ${p.team_type}`);
      });
    }
  }
  
  console.log('\n-------------------\n');
  
  // Get a sample of all data
  console.log('Query 3: Sample of all data (first 5):');
  const { data: query3, error: error3 } = await supabase
    .from('practice_schedules')
    .select('*')
    .limit(5);
  
  if (error3) {
    console.error('Error:', error3);
  } else {
    console.log(`Sample data:`);
    if (query3 && query3.length > 0) {
      query3.forEach(p => {
        console.log(`- ${p.day_of_week} ${p.start_time}-${p.end_time}`);
        console.log(`  Effective: ${p.effective_from} to ${p.effective_to}`);
        console.log(`  Active: ${p.is_active}`);
        console.log('');
      });
    }
  }
}

checkActivePractices().catch(console.error);