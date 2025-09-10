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

async function recreateParker() {
  try {
    // First, delete existing Parker
    const { error: deleteError } = await supabase
      .from('coaches')
      .delete()
      .eq('name', "Parker O'Connor");
    
    if (deleteError) {
      console.error('Error deleting Parker:', deleteError);
    } else {
      console.log('Deleted existing Parker O\'Connor entries');
    }
    
    // Get a visible coach to use as template
    const { data: template, error: templateError } = await supabase
      .from('coaches')
      .select('*')
      .eq('name', 'Steven Belcher')
      .single();
    
    if (templateError || !template) {
      console.error('Error getting template:', templateError);
      return;
    }
    
    console.log('Using Steven as template...');
    
    // Create Parker using Steven's structure
    const parkerData = {
      ...template,
      id: undefined, // Let database generate new ID
      name: "Parker O'Connor",
      first_name: 'Parker',
      last_name: "O'Connor",
      role: 'Assistant Coach',
      description: 'Parker brings enthusiasm and fresh perspective to the Wings of Steel coaching staff. With a passion for developing young athletes and promoting the inclusive spirit of sled hockey, Parker focuses on skill development and team building.',
      experience: 'Youth hockey coaching experience with a focus on adaptive sports',
      achievements: [
        'USA Hockey Coaching Certification',
        'Adaptive Sports Training Certification', 
        'Youth Development Specialist'
      ],
      start_date: '2025-01-01',
      created_at: undefined,
      updated_at: undefined
    };
    
    // Remove undefined fields
    Object.keys(parkerData).forEach(key => {
      if (parkerData[key] === undefined) {
        delete parkerData[key];
      }
    });
    
    console.log('Creating Parker with data:', parkerData);
    
    const { data: newParker, error: createError } = await supabase
      .from('coaches')
      .insert(parkerData)
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating Parker:', createError);
    } else {
      console.log('Successfully created Parker O\'Connor:', newParker);
    }
    
    // Check if Parker appears in view now
    const { data: checkView, error: viewError } = await supabase
      .from('coach_team_details')
      .select('name, role, team_type')
      .eq('team_type', 'youth');
    
    if (!viewError && checkView) {
      console.log('\nYouth team coaches in view:');
      checkView.forEach(c => {
        console.log(`  ${c.name === "Parker O'Connor" ? '✅' : '✓'} ${c.name} (${c.role})`);
      });
      
      const parkerInView = checkView.find(c => c.name === "Parker O'Connor");
      if (parkerInView) {
        console.log('\n🎉 SUCCESS: Parker O\'Connor is now visible!');
      } else {
        console.log('\n❌ Parker O\'Connor is still not visible');
        console.log('\nThis suggests the coach_team_details view has hardcoded IDs or a join table.');
        console.log('You may need to update the database view definition directly in Supabase.');
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

recreateParker();