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

async function analyzeCoachStructure() {
  try {
    // Get all coaches to compare
    const { data: allCoaches, error: coachError } = await supabase
      .from('coaches')
      .select('*')
      .order('created_at');
    
    if (coachError) {
      console.error('Error fetching coaches:', coachError);
      return;
    }
    
    console.log('All coaches in coaches table:');
    console.log('================================');
    allCoaches?.forEach(coach => {
      console.log(`\n${coach.name}:`);
      Object.keys(coach).forEach(key => {
        if (coach[key] !== null && coach[key] !== '' && key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
          console.log(`  ${key}: ${JSON.stringify(coach[key]).substring(0, 100)}`);
        }
      });
    });
    
    // Find what makes Steven, Norm, and Rico special
    const visibleCoaches = ['Steven Belcher', 'Norm Jones', 'Rico Gonzales'];
    const parker = allCoaches?.find(c => c.name === "Parker O'Connor");
    const visible = allCoaches?.filter(c => visibleCoaches.includes(c.name));
    
    if (parker && visible && visible.length > 0) {
      console.log('\n\nComparing Parker to visible coaches:');
      console.log('=====================================');
      
      const stevenKeys = Object.keys(visible[0]).filter(k => visible[0][k] !== null && visible[0][k] !== '');
      const parkerKeys = Object.keys(parker).filter(k => parker[k] !== null && parker[k] !== '');
      
      console.log('\nFields Steven has that Parker might be missing:');
      stevenKeys.forEach(key => {
        if (!parkerKeys.includes(key) || parker[key] === null || parker[key] === '') {
          console.log(`  - ${key}: Steven has "${visible[0][key]}", Parker has "${parker[key]}"`);
        }
      });
      
      console.log('\nFields Parker has that Steven doesn\'t:');
      parkerKeys.forEach(key => {
        if (!stevenKeys.includes(key)) {
          console.log(`  - ${key}: "${parker[key]}"`);
        }
      });
    }
    
    // Try to make Parker identical to Steven except for personal info
    if (parker && visible && visible.length > 0) {
      console.log('\n\nAttempting to make Parker match Steven\'s structure...');
      
      const steven = visible[0];
      const updateData: any = {};
      
      // Copy non-personal fields from Steven
      Object.keys(steven).forEach(key => {
        if (!['id', 'name', 'first_name', 'last_name', 'created_at', 'updated_at', 'description', 'experience'].includes(key)) {
          if (steven[key] !== null && steven[key] !== '' && (parker[key] === null || parker[key] === '')) {
            updateData[key] = steven[key];
          }
        }
      });
      
      // Remove fields that might cause issues
      delete updateData.team_type;
      delete updateData.team_role;
      delete updateData.is_head_coach;
      
      if (Object.keys(updateData).length > 0) {
        console.log('Updating Parker with:', updateData);
        
        const { data: updated, error: updateError } = await supabase
          .from('coaches')
          .update(updateData)
          .eq('id', parker.id)
          .select()
          .single();
        
        if (updateError) {
          console.error('Error updating Parker:', updateError);
        } else {
          console.log('Successfully updated Parker');
        }
      }
    }
    
    // Final check
    const { data: finalCheck, error: finalError } = await supabase
      .from('coach_team_details')
      .select('name, role, team_type')
      .eq('team_type', 'youth');
    
    if (!finalError && finalCheck) {
      console.log('\n\nFinal check - Youth team coaches in view:');
      finalCheck.forEach(c => {
        console.log(`  ✓ ${c.name} (${c.role})`);
      });
      
      const parkerInView = finalCheck.find(c => c.name === "Parker O'Connor");
      if (parkerInView) {
        console.log('\n🎉 SUCCESS: Parker O\'Connor is now visible!');
      } else {
        console.log('\n❌ Parker O\'Connor is still not visible in the view');
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

analyzeCoachStructure();