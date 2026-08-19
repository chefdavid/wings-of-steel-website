function isMissingActiveColumn(error) {
  return error?.message?.includes('active') || error?.code === 'PGRST204';
}

function stripActive(playerData) {
  const { active: _active, ...playerDataWithoutActive } = playerData;
  void _active;
  return playerDataWithoutActive;
}

async function updatePlayer(supabase, id, playerData) {
  let { data, error } = await supabase
    .from('players')
    .update(playerData)
    .eq('id', id)
    .select();

  if (error && isMissingActiveColumn(error)) {
    ({ data, error } = await supabase
      .from('players')
      .update(stripActive(playerData))
      .eq('id', id)
      .select());
  }

  if (error) throw error;
  if (!data?.length) {
    throw new Error('Player update returned no rows. The player may not exist.');
  }

  return data[0];
}

async function insertPlayer(supabase, playerData) {
  let { data, error } = await supabase.from('players').insert([playerData]).select();

  if (error && isMissingActiveColumn(error)) {
    ({ data, error } = await supabase
      .from('players')
      .insert([stripActive(playerData)])
      .select());
  }

  if (error) throw error;
  if (!data?.length) {
    throw new Error('Player insert returned no rows.');
  }

  return data[0];
}

async function deletePlayer(supabase, id) {
  const { data, error } = await supabase.from('players').delete().eq('id', id).select('id');

  if (error) throw error;
  if (!data?.length) {
    throw new Error('Player delete returned no rows. The player may not exist.');
  }
}

async function assignYouthTeam(supabase, playerId, teamAssignment) {
  const { jersey_number, position, tags, team_type = 'youth' } = teamAssignment;
  const { error } = await supabase.from('player_teams').insert([
    {
      player_id: playerId,
      team_type,
      jersey_number,
      position,
      is_captain: Array.isArray(tags) && tags.some((tag) => tag.toLowerCase().includes('captain')),
    },
  ]);

  if (error) {
    console.error('Failed to assign player to team:', error);
    return 'Player was saved but could not be assigned to the team.';
  }

  return null;
}

async function assignTeam(supabase, teamAssignment) {
  const { player_id, team_type, jersey_number, position, is_captain } = teamAssignment;
  const { data, error } = await supabase
    .from('player_teams')
    .insert([
      {
        player_id,
        team_type,
        jersey_number,
        position,
        is_captain: is_captain || false,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function removeTeam(supabase, playerId, teamType) {
  const { data, error } = await supabase
    .from('player_teams')
    .delete()
    .eq('player_id', playerId)
    .eq('team_type', teamType)
    .select('id');

  if (error) throw error;
  if (!data?.length) {
    throw new Error('Team removal returned no rows.');
  }
}

export async function handleAdminPlayers(supabase, payload) {
  const { action, id, playerData, teamAssignment } = payload;

  if (!action) {
    return { statusCode: 400, body: { error: 'Missing action' } };
  }

  if (action === 'update') {
    if (!id || !playerData) {
      return { statusCode: 400, body: { error: 'Update requires id and playerData' } };
    }
    const player = await updatePlayer(supabase, id, playerData);
    return { statusCode: 200, body: { player } };
  }

  if (action === 'insert') {
    if (!playerData) {
      return { statusCode: 400, body: { error: 'Insert requires playerData' } };
    }
    const player = await insertPlayer(supabase, playerData);
    let warning = null;
    if (teamAssignment) {
      warning = await assignYouthTeam(supabase, player.id, teamAssignment);
    }
    return { statusCode: 200, body: { player, warning } };
  }

  if (action === 'delete') {
    if (!id) {
      return { statusCode: 400, body: { error: 'Delete requires id' } };
    }
    await deletePlayer(supabase, id);
    return { statusCode: 200, body: { ok: true } };
  }

  if (action === 'assign-team') {
    if (!teamAssignment?.player_id || !teamAssignment?.team_type) {
      return { statusCode: 400, body: { error: 'assign-team requires player_id and team_type' } };
    }
    const assignment = await assignTeam(supabase, teamAssignment);
    return { statusCode: 200, body: { assignment } };
  }

  if (action === 'remove-team') {
    if (!id || !teamAssignment?.team_type) {
      return { statusCode: 400, body: { error: 'remove-team requires id and team_type' } };
    }
    await removeTeam(supabase, id, teamAssignment.team_type);
    return { statusCode: 200, body: { ok: true } };
  }

  return { statusCode: 400, body: { error: `Unknown action: ${action}` } };
}
