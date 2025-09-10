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

async function checkPracticeSchedule() {
  console.log('Checking practice schedules...\n');
  
  // Check all practice schedules
  const { data: allSchedules, error: allError } = await supabase
    .from('practice_schedules')
    .select('*')
    .order('practice_date', { ascending: true });
  
  if (allError) {
    console.error('Error fetching practice schedules:', allError);
    return;
  }
  
  console.log(`Total practice schedules: ${allSchedules?.length || 0}`);
  
  if (allSchedules && allSchedules.length > 0) {
    console.log('\nFirst few practice schedules:');
    allSchedules.slice(0, 5).forEach(schedule => {
      console.log(`- ${schedule.practice_date} ${schedule.start_time}-${schedule.end_time}`);
      console.log(`  Day: ${schedule.day_of_week}, Team: ${schedule.team_type}, Active: ${schedule.is_active}`);
      console.log(`  Location: ${schedule.location || 'Not specified'}`);
      console.log('');
    });
  } else {
    console.log('No practice schedules found in database');
  }
  
  // Check for active future schedules
  const today = new Date().toISOString().split('T')[0];
  const { data: futureSchedules, error: futureError } = await supabase
    .from('practice_schedules')
    .select('*')
    .eq('is_active', true)
    .gte('practice_date', today)
    .order('practice_date')
    .limit(5);
  
  if (!futureError) {
    console.log(`\nUpcoming active practice schedules (from ${today}): ${futureSchedules?.length || 0}`);
    if (futureSchedules && futureSchedules.length > 0) {
      futureSchedules.forEach(schedule => {
        console.log(`- ${schedule.practice_date} ${schedule.start_time} ${schedule.day_of_week}`);
      });
    }
  }
}

checkPracticeSchedule().catch(console.error);