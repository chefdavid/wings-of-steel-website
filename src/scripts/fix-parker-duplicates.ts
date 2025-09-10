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

async function fixParkerDuplicates() {
  try {
    // Get all Parker O'Connor entries
    const { data: parkers, error: fetchError } = await supabase
      .from('coaches')
      .select('*')
      .or(`name.eq.Parker O'Connor,first_name.eq.Parker`)
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      console.error('Error fetching Parkers:', fetchError);
      return;
    }
    
    console.log(`Found ${parkers?.length || 0} Parker entries:`);
    parkers?.forEach((p, i) => {
      console.log(`${i + 1}. ID: ${p.id}`);
      console.log(`   Name: ${p.name}`);
      console.log(`   Created: ${p.created_at}`);
      console.log(`   Team Type: ${p.team_type || 'not set'}`);
      console.log('---');
    });
    
    if (parkers && parkers.length > 1) {
      // Keep the most recent one, delete others
      const [keepParker, ...duplicates] = parkers;
      
      console.log(`\nKeeping Parker with ID: ${keepParker.id}`);
      
      // Delete duplicates
      for (const dup of duplicates) {
        const { error: deleteError } = await supabase
          .from('coaches')
          .delete()
          .eq('id', dup.id);
        
        if (deleteError) {
          console.error(`Error deleting duplicate ${dup.id}:`, deleteError);
        } else {
          console.log(`Deleted duplicate with ID: ${dup.id}`);
        }
      }
      
      // Update the kept Parker with team info
      const { data: updated, error: updateError } = await supabase
        .from('coaches')
        .update({ 
          team_type: 'youth',
          team_role: 'Assistant Coach',
          is_head_coach: false
        })
        .eq('id', keepParker.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating Parker with team info:', updateError);
        console.log('Note: team_type might not be a column in coaches table');
      } else {
        console.log('\nSuccessfully updated Parker with team info:', updated);
      }
    } else if (parkers && parkers.length === 1) {
      // Just update the single Parker
      const parker = parkers[0];
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
        console.error('Error updating Parker with team info:', updateError);
        console.log('Note: team_type might not be a column in coaches table');
      } else {
        console.log('\nSuccessfully updated Parker with team info');
      }
    }
    
    // Final check in the view
    const { data: checkView, error: viewError } = await supabase
      .from('coach_team_details')
      .select('name, role, team_type')
      .eq('team_type', 'youth');
    
    if (!viewError && checkView) {
      console.log('\nAll youth team coaches:');
      checkView.forEach(c => {
        console.log(`- ${c.name} (${c.role})`);
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

fixParkerDuplicates();