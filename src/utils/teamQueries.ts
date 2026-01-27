import { supabase } from '../lib/supabaseClient';
import type { TeamType } from '../types/team';
import type { Player, Coach, PlayerWithTeams, CoachWithTeams } from '../types/database';

/**
 * Team-specific database query utilities using junction tables
 */

export const getTeamPlayers = async (teamType: TeamType): Promise<PlayerWithTeams[]> => {
  try {
    // Add timestamp to force cache bypass
    const timestamp = Date.now();

    const { data, error } = await supabase
      .from('player_team_details')
      .select('*')
      .eq('team_type', teamType)
      .order('team_jersey_number', { ascending: true })
      .limit(100) // Add limit to force fresh query
      .range(0, 99); // Add range to bypass cache

    if (error) throw error;

    // Removed debug logs

    // Transform the data to match PlayerWithTeams interface
    const playersWithTeams: PlayerWithTeams[] = (data || []).map(player => ({
      ...player,
      jersey_number: player.team_jersey_number || player.jersey_number,
      position: player.position || player.team_position, // Use position from players table first
      team_assignments: [],
      current_team: {
        team_type: player.team_type,
        jersey_number: player.team_jersey_number,
        position: player.position || player.team_position, // Use position from players table first
        is_captain: player.is_captain
      }
    }));

    return playersWithTeams;
  } catch (error) {
    console.error('Error fetching team players:', error);
    return [];
  }
};

export const getTeamCoaches = async (teamType: TeamType): Promise<CoachWithTeams[]> => {
  try {
    // TEMPORARY WORKAROUND: Fetch directly from coaches table
    // The coach_team_details view is not including Parker O'Connor
    // TODO: Fix the database view to include all coaches
    
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    // Transform the data to match CoachWithTeams interface
    // Since we're fetching from coaches table, we need to add team info
    const coachesWithTeams: CoachWithTeams[] = (data || []).map(coach => ({
      ...coach,
      team_type: 'youth', // Default to youth team
      team_role: coach.role,
      is_head_coach: coach.role === 'Head Coach',
      role: coach.role,
      team_assignments: [],
      current_team: {
        team_type: 'youth',
        role: coach.role,
        is_head_coach: coach.role === 'Head Coach'
      }
    }));

    return coachesWithTeams;
  } catch (error) {
    console.error('Error fetching team coaches:', error);
    return [];
  }
};

export const getTeamSiteSection = async (teamType: TeamType, sectionName: string) => {
  try {
    const { data, error } = await supabase
      .from('site_sections')
      .select('*')
      .eq('team_type', teamType)
      .eq('section_name', sectionName)
      .single();

    if (error) {
      // If no team-specific section found, try to get the default (youth) section
      if (teamType !== 'youth') {
        const { data: defaultData, error: defaultError } = await supabase
          .from('site_sections')
          .select('*')
          .eq('team_type', 'youth')
          .eq('section_name', sectionName)
          .single();
        
        if (defaultError) throw defaultError;
        return defaultData;
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error fetching team site section:', error);
    return null;
  }
};

export const createTeamPlayer = async (playerData: Omit<Player, 'id'>, teamType: TeamType) => {
  try {
    const { data, error } = await supabase
      .from('players')
      .insert({ ...playerData, team_type: teamType })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating team player:', error);
    throw error;
  }
};

export const createTeamCoach = async (coachData: Omit<Coach, 'id'>, teamType: TeamType) => {
  try {
    const { data, error } = await supabase
      .from('coaches')
      .insert({ ...coachData, team_type: teamType })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating team coach:', error);
    throw error;
  }
};

export const updateTeamPlayer = async (playerId: string, updates: Partial<Player>, teamType: TeamType) => {
  try {
    const { data, error } = await supabase
      .from('players')
      .update(updates)
      .eq('id', playerId)
      .eq('team_type', teamType)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating team player:', error);
    throw error;
  }
};

export const updateTeamCoach = async (coachId: string, updates: Partial<Coach>, teamType: TeamType) => {
  try {
    const { data, error } = await supabase
      .from('coaches')
      .update(updates)
      .eq('id', coachId)
      .eq('team_type', teamType)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating team coach:', error);
    throw error;
  }
};

export const deleteTeamPlayer = async (playerId: string, teamType: TeamType) => {
  try {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId)
      .eq('team_type', teamType);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting team player:', error);
    throw error;
  }
};

export const deleteTeamCoach = async (coachId: string, teamType: TeamType) => {
  try {
    const { error } = await supabase
      .from('coaches')
      .delete()
      .eq('id', coachId)
      .eq('team_type', teamType);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting team coach:', error);
    throw error;
  }
};

export const getUserRole = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
};

export const getTeamSettings = async (teamType: TeamType) => {
  try {
    const { data, error } = await supabase
      .from('team_settings')
      .select('*')
      .eq('team_type', teamType)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching team settings:', error);
    return null;
  }
};

// Team assignment management functions
export const addPlayerToTeam = async (playerId: string, teamType: TeamType, assignment: {
  jersey_number?: number;
  position?: string;
  is_captain?: boolean;
}) => {
  try {
    const { data, error } = await supabase
      .from('player_teams')
      .insert({
        player_id: playerId,
        team_type: teamType,
        jersey_number: assignment.jersey_number,
        position: assignment.position,
        is_captain: assignment.is_captain || false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding player to team:', error);
    throw error;
  }
};

export const removePlayerFromTeam = async (playerId: string, teamType: TeamType) => {
  try {
    const { error } = await supabase
      .from('player_teams')
      .delete()
      .eq('player_id', playerId)
      .eq('team_type', teamType);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing player from team:', error);
    throw error;
  }
};

export const addCoachToTeam = async (coachId: string, teamType: TeamType, assignment: {
  role?: string;
  is_head_coach?: boolean;
}) => {
  try {
    const { data, error } = await supabase
      .from('coach_teams')
      .insert({
        coach_id: coachId,
        team_type: teamType,
        role: assignment.role,
        is_head_coach: assignment.is_head_coach || false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding coach to team:', error);
    throw error;
  }
};

export const removeCoachFromTeam = async (coachId: string, teamType: TeamType) => {
  try {
    const { error } = await supabase
      .from('coach_teams')
      .delete()
      .eq('coach_id', coachId)
      .eq('team_type', teamType);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing coach from team:', error);
    throw error;
  }
};

export const getPlayerTeamAssignments = async (playerId: string) => {
  try {
    const { data, error } = await supabase
      .from('player_teams')
      .select('*')
      .eq('player_id', playerId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching player team assignments:', error);
    return [];
  }
};

export const getCoachTeamAssignments = async (coachId: string) => {
  try {
    const { data, error } = await supabase
      .from('coach_teams')
      .select('*')
      .eq('coach_id', coachId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching coach team assignments:', error);
    return [];
  }
};