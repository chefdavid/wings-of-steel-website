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

async function checkCoachTeamDetails() {
  console.log('Checking coach_team_details view...\n');
  
  // This is what the Team component actually queries
  const { data, error } = await supabase
    .from('coach_team_details')
    .select('*')
    .eq('team_type', 'youth')
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching coach_team_details:', error);
    
    // Try just coaches table
    console.log('\nTrying coaches table directly...');
    const { data: coachesData, error: coachesError } = await supabase
      .from('coaches')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (!coachesError && coachesData) {
      console.log('All coaches in table:');
      coachesData.forEach(coach => {
        console.log(`- ${coach.name} (${coach.role}) - Created: ${coach.created_at}`);
      });
    }
    return;
  }
  
  console.log(`Found ${data?.length || 0} coaches in coach_team_details for youth team:\n`);
  
  if (data && data.length > 0) {
    data.forEach(coach => {
      console.log(`Coach: ${coach.first_name} ${coach.last_name}`);
      console.log(`  Role: ${coach.role}`);
      console.log(`  Team: ${coach.team_type}`);
      console.log(`  Created: ${coach.created_at}`);
      console.log('---');
    });
    
    // Check if Parker is in the list
    const parker = data.find(c => c.first_name === 'Parker' || c.last_name === "O'Connor");
    if (parker) {
      console.log('\n✅ Parker O\'Connor is in coach_team_details');
    } else {
      console.log('\n❌ Parker O\'Connor is NOT in coach_team_details');
      
      // Check if view columns exist
      console.log('\nFirst coach columns (to see what view expects):');
      console.log(Object.keys(data[0]).join(', '));
    }
  }
}

checkCoachTeamDetails().catch(console.error);