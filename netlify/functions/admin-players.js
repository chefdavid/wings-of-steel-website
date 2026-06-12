import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  };
}

function getClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase service-role credentials are missing.');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function isMissingActiveColumn(error) {
  return error?.message?.includes('active') || error?.code === 'PGRST204';
}

async function updatePlayer(supabase, id, playerData) {
  let { data, error } = await supabase
    .from('players')
    .update(playerData)
    .eq('id', id)
    .select();

  if (error && isMissingActiveColumn(error)) {
    const { active, ...playerDataWithoutActive } = playerData;
    ({ data, error } = await supabase
      .from('players')
      .update(playerDataWithoutActive)
      .eq('id', id)
      .select());
  }

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('Player update returned no rows. The player may not exist.');
  }

  return data[0];
}

async function insertPlayer(supabase, playerData) {
  let { data, error } = await supabase.from('players').insert([playerData]).select();

  if (error && isMissingActiveColumn(error)) {
    const { active, ...playerDataWithoutActive } = playerData;
    ({ data, error } = await supabase
      .from('players')
      .insert([playerDataWithoutActive])
      .select());
  }

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('Player insert returned no rows.');
  }

  return data[0];
}

async function deletePlayer(supabase, id) {
  const { data, error } = await supabase.from('players').delete().eq('id', id).select('id');

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('Player delete returned no rows. The player may not exist.');
  }
}

async function assignYouthTeam(supabase, playerId, { jersey_number, position, tags }) {
  const { error } = await supabase.from('player_teams').insert([
    {
      player_id: playerId,
      team_type: 'youth',
      jersey_number,
      position,
      is_captain: Array.isArray(tags) && tags.some((tag) => tag.toLowerCase().includes('captain')),
    },
  ]);

  if (error) {
    console.error('Failed to assign player to youth team:', error);
    return { warning: 'Player was saved but could not be assigned to the youth team.' };
  }

  return null;
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  try {
    const supabase = getClient();
    const { action, id, playerData, teamAssignment } = JSON.parse(event.body || '{}');

    if (!action) {
      return jsonResponse(400, { error: 'Missing action' });
    }

    if (action === 'update') {
      if (!id || !playerData) {
        return jsonResponse(400, { error: 'Update requires id and playerData' });
      }
      const player = await updatePlayer(supabase, id, playerData);
      return jsonResponse(200, { player });
    }

    if (action === 'insert') {
      if (!playerData) {
        return jsonResponse(400, { error: 'Insert requires playerData' });
      }
      const player = await insertPlayer(supabase, playerData);
      let warning = null;
      if (teamAssignment) {
        const teamWarning = await assignYouthTeam(supabase, player.id, teamAssignment);
        warning = teamWarning?.warning ?? null;
      }
      return jsonResponse(200, { player, warning });
    }

    if (action === 'delete') {
      if (!id) {
        return jsonResponse(400, { error: 'Delete requires id' });
      }
      await deletePlayer(supabase, id);
      return jsonResponse(200, { ok: true });
    }

    return jsonResponse(400, { error: `Unknown action: ${action}` });
  } catch (error) {
    console.error('admin-players error:', error);
    return jsonResponse(500, { error: error.message || 'Failed to save player' });
  }
};
