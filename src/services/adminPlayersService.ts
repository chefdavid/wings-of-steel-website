type PlayerWritePayload = Record<string, unknown>;

type TeamAssignmentPayload = {
  jersey_number: number;
  position: string;
  tags: string[];
  team_type?: 'youth' | 'adult';
};

type AdminTeamAssignmentPayload = {
  player_id: string;
  team_type: 'youth' | 'adult';
  jersey_number?: number;
  position?: string;
  is_captain?: boolean;
};

async function callAdminPlayers(body: Record<string, unknown>) {
  const response = await fetch('/.netlify/functions/admin-players', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || `Request failed with status ${response.status}`);
  }

  return result;
}

export async function updateAdminPlayer(id: string, playerData: PlayerWritePayload) {
  const result = await callAdminPlayers({ action: 'update', id, playerData });
  return result.player;
}

export async function insertAdminPlayer(
  playerData: PlayerWritePayload,
  teamAssignment?: TeamAssignmentPayload
) {
  const result = await callAdminPlayers({ action: 'insert', playerData, teamAssignment });
  return { player: result.player, warning: result.warning as string | undefined };
}

export async function deleteAdminPlayer(id: string) {
  await callAdminPlayers({ action: 'delete', id });
}

export async function assignAdminPlayerTeam(teamAssignment: AdminTeamAssignmentPayload) {
  const result = await callAdminPlayers({ action: 'assign-team', teamAssignment });
  return result.assignment;
}

export async function removeAdminPlayerTeam(playerId: string, teamType: 'youth' | 'adult') {
  await callAdminPlayers({
    action: 'remove-team',
    id: playerId,
    teamAssignment: { team_type: teamType },
  });
}
