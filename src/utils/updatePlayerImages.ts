import { supabase } from '../lib/supabaseClient';

// Mapping of player/coach names to their image files
const imageMapping = {
  players: [
    { first_name: 'AJ', image_url: '/images/players/aj.webp' },
    { first_name: 'Andrew', image_url: '/images/players/andrew.webp' },
    { first_name: 'Colin', image_url: '/images/players/colin.webp' },
    { first_name: 'Colton', image_url: '/images/players/colton.webp' },
    { first_name: 'Jack', image_url: '/images/players/jack.webp' },
    { first_name: 'Laurel', image_url: '/images/players/laurel.webp' },
    { first_name: 'Logan', image_url: '/images/players/logan.webp' },
    { first_name: 'Zach', image_url: '/images/players/zach.webp' },
  ],
  coaches: [
    { first_name: 'Norm', image_url: '/images/players/Coach Norm.webp' },
    { first_name: 'Rico', image_url: '/images/players/coach rico.webp' },
  ]
};

export const updatePlayerImages = async () => {
  console.log('Starting to update player images...');
  
  // Update players
  for (const playerImage of imageMapping.players) {
    try {
      // First, get the player(s) with matching first name
      const { data: players, error: fetchError } = await supabase
        .from('players')
        .select('*')
        .ilike('first_name', playerImage.first_name);
      
      if (fetchError) {
        console.error(`Error fetching ${playerImage.first_name}:`, fetchError);
        continue;
      }
      
      if (!players || players.length === 0) {
        console.warn(`No player found with first name: ${playerImage.first_name}`);
        continue;
      }
      
      // Update each matching player
      for (const player of players) {
        const { error: updateError } = await supabase
          .from('players')
          .update({ image_url: playerImage.image_url })
          .eq('id', player.id);
        
        if (updateError) {
          console.error(`Error updating ${playerImage.first_name} (ID: ${player.id}):`, updateError);
        } else {
          console.log(`✓ Updated ${playerImage.first_name} (ID: ${player.id}) with image ${playerImage.image_url}`);
        }
      }
    } catch (err) {
      console.error(`Failed to update ${playerImage.first_name}:`, err);
    }
  }
  
  console.log('Player images updated!');
};

export const updateCoachImages = async () => {
  console.log('Starting to update coach images...');
  
  // Update coaches
  for (const coachImage of imageMapping.coaches) {
    try {
      // First, get the coach(es) with matching first name
      const { data: coaches, error: fetchError } = await supabase
        .from('coaches')
        .select('*')
        .ilike('first_name', coachImage.first_name);
      
      if (fetchError) {
        console.error(`Error fetching Coach ${coachImage.first_name}:`, fetchError);
        continue;
      }
      
      if (!coaches || coaches.length === 0) {
        console.warn(`No coach found with first name: ${coachImage.first_name}`);
        continue;
      }
      
      // Update each matching coach
      for (const coach of coaches) {
        const { error: updateError } = await supabase
          .from('coaches')
          .update({ image_url: coachImage.image_url })
          .eq('id', coach.id);
        
        if (updateError) {
          console.error(`Error updating Coach ${coachImage.first_name} (ID: ${coach.id}):`, updateError);
        } else {
          console.log(`✓ Updated Coach ${coachImage.first_name} (ID: ${coach.id}) with image ${coachImage.image_url}`);
        }
      }
    } catch (err) {
      console.error(`Failed to update Coach ${coachImage.first_name}:`, err);
    }
  }
  
  console.log('Coach images updated!');
};

export const updateAllImages = async () => {
  await updatePlayerImages();
  await updateCoachImages();
  console.log('All images updated successfully!');
};

export const checkCurrentImages = async () => {
  console.log('Checking current player images...');
  
  const { data: players, error: playersError } = await supabase
    .from('players')
    .select('id, first_name, last_name, image_url')
    .order('first_name');
  
  if (playersError) {
    console.error('Error fetching players:', playersError);
    return;
  }
  
  console.log('Current player images:');
  players?.forEach(player => {
    console.log(`- ${player.first_name} ${player.last_name}: ${player.image_url || 'NO IMAGE'}`);
  });
  
  const { data: coaches, error: coachesError } = await supabase
    .from('coaches')
    .select('id, first_name, last_name, image_url')
    .order('first_name');
  
  if (coachesError) {
    console.error('Error fetching coaches:', coachesError);
    return;
  }
  
  console.log('\nCurrent coach images:');
  coaches?.forEach(coach => {
    console.log(`- ${coach.first_name} ${coach.last_name}: ${coach.image_url || 'NO IMAGE'}`);
  });
};