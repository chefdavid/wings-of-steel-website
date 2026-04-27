import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function fixLaurelPosition() {
  console.log('🔧 Fixing Laurel position directly...');

  // First find Laurel
  const { data: laurel, error: findError } = await supabase
    .from('players')
    .select('*')
    .ilike('first_name', 'laurel')
    .single();

  if (findError || !laurel) {
    console.error('❌ Could not find Laurel:', findError);
    return;
  }

  console.log('👤 Found Laurel:', {
    id: laurel.id,
    name: `${laurel.first_name} ${laurel.last_name}`,
    current_position: laurel.position
  });

  // Update position in players table
  const { error: updateError } = await supabase
    .from('players')
    .update({ position: 'Offense' })
    .eq('id', laurel.id);

  if (updateError) {
    console.error('❌ Error updating player position:', updateError);
  } else {
    console.log('✅ Updated position in players table to Offense');
  }

  // Try to update in player_team_assignments if it exists
  const { error: teamError } = await supabase
    .from('player_team_assignments')
    .update({ position: 'Offense' })
    .eq('player_id', laurel.id);

  if (!teamError) {
    console.log('✅ Updated position in player_team_assignments');
  }

  // Force refresh the view by querying it
  const { data: viewData } = await supabase
    .from('player_team_details')
    .select('first_name, position, team_position')
    .eq('id', laurel.id)
    .single();

  console.log('📊 Current view data:', viewData);
}

fixLaurelPosition();
