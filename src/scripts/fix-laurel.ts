import { supabaseAdmin } from '../lib/supabaseAdmin';

async function fixLaurelPosition() {
  console.log('🔧 Fixing Laurel position directly...');

  // First find Laurel
  const { data: laurel, error: findError } = await supabaseAdmin
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
  const { error: updateError } = await supabaseAdmin
    .from('players')
    .update({ position: 'Offense' })
    .eq('id', laurel.id);

  if (updateError) {
    console.error('❌ Error updating player position:', updateError);
  } else {
    console.log('✅ Updated position in players table to Offense');
  }

  // Try to update in player_team_assignments if it exists
  const { error: teamError } = await supabaseAdmin
    .from('player_team_assignments')
    .update({ position: 'Offense' })
    .eq('player_id', laurel.id);

  if (!teamError) {
    console.log('✅ Updated position in player_team_assignments');
  }

  // Force refresh the view by querying it
  const { data: viewData } = await supabaseAdmin
    .from('player_team_details')
    .select('first_name, position, team_position')
    .eq('id', laurel.id)
    .single();

  console.log('📊 Current view data:', viewData);
}

fixLaurelPosition();