import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateParkerTeam() {
  try {
    // First check if team_type column exists in coaches table
    const { data: parker, error: fetchError } = await supabase
      .from('coaches')
      .select('*')
      .eq('name', "Parker O'Connor")
      .single();
    
    if (fetchError) {
      console.error('Error fetching Parker:', fetchError);
      return;
    }
    
    console.log('Found Parker:', parker);
    
    // Check what the existing coaches have
    const { data: existingCoaches, error: existingError } = await supabase
      .from('coach_team_details')
      .select('*')
      .eq('team_type', 'youth')
      .limit(1);
    
    if (!existingError && existingCoaches && existingCoaches.length > 0) {
      console.log('\nSample existing coach in view:', existingCoaches[0]);
    }
    
    // Try to update Parker with team_type
    const { data: updated, error: updateError } = await supabase
      .from('coaches')
      .update({ 
        team_type: 'youth',
        team_role: 'Assistant Coach',
        is_head_coach: false
      })
      .eq('id', parker.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating Parker:', updateError);
      
      // If team_type doesn't exist on coaches, we might need a junction table
      console.log('\nLooking for coach_team_assignments table...');
      
      const { data: assignment, error: assignError } = await supabase
        .from('coach_team_assignments')
        .insert({
          coach_id: parker.id,
          team_type: 'youth',
          role: 'Assistant Coach',
          is_head_coach: false,
          assigned_date: '2025-01-01'
        })
        .select();
      
      if (assignError) {
        console.error('Assignment error:', assignError);
      } else {
        console.log('Created assignment:', assignment);
      }
    } else {
      console.log('Successfully updated Parker with team info:', updated);
    }
    
    // Check if Parker now appears in the view
    const { data: checkView, error: viewError } = await supabase
      .from('coach_team_details')
      .select('*')
      .eq('team_type', 'youth');
    
    if (!viewError && checkView) {
      const parkerInView = checkView.find(c => c.name === "Parker O'Connor");
      if (parkerInView) {
        console.log('\n✅ Parker O\'Connor now appears in coach_team_details view!');
      } else {
        console.log('\n❌ Parker O\'Connor still not in coach_team_details view');
        console.log('All coaches in view:', checkView.map(c => c.name));
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

updateParkerTeam();