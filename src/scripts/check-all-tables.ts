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

async function checkAllTables() {
  console.log('Checking all coach-related tables and views...\n');
  
  // 1. Check coaches table
  console.log('1. COACHES TABLE:');
  console.log('==================');
  const { data: coaches, error: coachError } = await supabase
    .from('coaches')
    .select('id, name, role')
    .order('name');
  
  if (coachError) {
    console.error('Error:', coachError);
  } else {
    coaches?.forEach(c => {
      console.log(`  ${c.name === "Parker O'Connor" ? '→' : ' '} ${c.name} (${c.role})`);
    });
    const hasParker = coaches?.some(c => c.name === "Parker O'Connor");
    console.log(`  Parker in coaches table: ${hasParker ? '✅ YES' : '❌ NO'}`);
  }
  
  // 2. Check coach_team_details view
  console.log('\n2. COACH_TEAM_DETAILS VIEW (youth):');
  console.log('=====================================');
  const { data: teamDetails, error: teamError } = await supabase
    .from('coach_team_details')
    .select('id, name, role, team_type')
    .eq('team_type', 'youth')
    .order('name');
  
  if (teamError) {
    console.error('Error:', teamError);
  } else {
    teamDetails?.forEach(c => {
      console.log(`  ${c.name === "Parker O'Connor" ? '→' : ' '} ${c.name} (${c.role})`);
    });
    const hasParker = teamDetails?.some(c => c.name === "Parker O'Connor");
    console.log(`  Parker in view: ${hasParker ? '✅ YES' : '❌ NO'}`);
  }
  
  // 3. Try coach_team_assignments if it exists
  console.log('\n3. COACH_TEAM_ASSIGNMENTS TABLE (if exists):');
  console.log('==============================================');
  const { data: assignments, error: assignError } = await supabase
    .from('coach_team_assignments')
    .select('*')
    .eq('team_type', 'youth');
  
  if (assignError) {
    if (assignError.code === 'PGRST204' || assignError.message?.includes('relation')) {
      console.log('  Table does not exist or is not accessible');
    } else {
      console.error('  Error:', assignError);
    }
  } else {
    console.log('  Found assignments:', assignments?.length || 0);
    assignments?.forEach(a => {
      console.log(`    Coach ID: ${a.coach_id}, Team: ${a.team_type}, Role: ${a.role}`);
    });
  }
  
  // 4. Get Parker's ID
  const parker = coaches?.find(c => c.name === "Parker O'Connor");
  if (parker) {
    console.log(`\n4. PARKER'S DETAILS:`);
    console.log('=====================');
    console.log(`  ID: ${parker.id}`);
    console.log(`  Name: ${parker.name}`);
    console.log(`  Role: ${parker.role}`);
    
    // Check if Parker's ID appears anywhere in team details
    const parkerInView = teamDetails?.find(c => c.id === parker.id);
    if (!parkerInView) {
      console.log('\n  ⚠️  Parker\'s ID is not in coach_team_details view');
      console.log('  This means the view is filtering them out');
    }
  }
  
  // 5. Compare IDs
  console.log('\n5. ID COMPARISON:');
  console.log('==================');
  const coachIds = coaches?.map(c => c.id) || [];
  const viewIds = teamDetails?.map(c => c.id) || [];
  
  console.log('Coaches in table but NOT in view:');
  coachIds.forEach(id => {
    if (!viewIds.includes(id)) {
      const coach = coaches?.find(c => c.id === id);
      console.log(`  - ${coach?.name} (ID: ${id})`);
    }
  });
}

checkAllTables().catch(console.error);