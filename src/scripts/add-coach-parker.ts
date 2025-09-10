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

async function addParkerOConnor() {
  try {
    // First, add Parker O'Connor to the coaches table
    const { data: coach, error: coachError } = await supabase
      .from('coaches')
      .insert({
        first_name: 'Parker',
        last_name: "O'Connor",
        name: "Parker O'Connor",
        role: 'Assistant Coach',
        description: 'Parker brings enthusiasm and fresh perspective to the Wings of Steel coaching staff. With a passion for developing young athletes and promoting the inclusive spirit of sled hockey, Parker focuses on skill development and team building.',
        experience: 'Youth hockey coaching experience with a focus on adaptive sports',
        start_date: '2025-01-01',
        achievements: [
          'USA Hockey Coaching Certification',
          'Adaptive Sports Training Certification',
          'Youth Development Specialist'
        ],
        image_url: '',
        contacts: [],
        emergency_contact: {},
        coach_notes: null
      })
      .select()
      .single();

    if (coachError) {
      console.error('Error adding coach:', coachError);
      return;
    }

    console.log('Successfully added Parker O\'Connor as coach:', coach);

    // Now add the team assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('coach_team_assignments')
      .insert({
        coach_id: coach.id,
        team_type: 'youth',
        role: 'Assistant Coach',
        is_head_coach: false,
        assigned_date: '2025-01-01',
        is_active: true
      })
      .select()
      .single();

    if (assignmentError) {
      console.error('Error adding team assignment:', assignmentError);
      return;
    }

    console.log('Successfully assigned Parker O\'Connor to youth team:', assignment);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

addParkerOConnor();