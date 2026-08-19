const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixLaurelPosition() {
  console.log('🔧 Fixing Laurel position...\n');

  // Find Laurel in players table
  const { data: players, error: findError } = await supabase
    .from('players')
    .select('*')
    .ilike('first_name', 'laurel');

  if (findError) {
    console.error('❌ Error finding Laurel:', findError);
    return;
  }

  if (!players || players.length === 0) {
    console.error('❌ Laurel not found');
    return;
  }

  const laurel = players[0];
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
    console.error('❌ Error updating players table:', updateError);
  } else {
    console.log('✅ Updated position in players table to Offense');
  }

  // Skip checking tables - it's erroring

  // Try to check the view
  console.log('\n🔍 Checking player_team_details view...');
  const { data: viewData, error: viewError } = await supabase
    .from('player_team_details')
    .select('*')
    .eq('id', laurel.id);

  if (viewError) {
    console.error('❌ Error reading view:', viewError.message);
  } else if (viewData && viewData[0]) {
    console.log('📊 View data for Laurel:');
    console.log('  - position:', viewData[0].position);
    console.log('  - team_position:', viewData[0].team_position);
    console.log('  - team_type:', viewData[0].team_type);
  }

  console.log('\n✅ Done! Refresh the page to see changes.');
}

fixLaurelPosition();
