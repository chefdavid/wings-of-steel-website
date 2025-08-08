import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { TEAM_CONFIGS, getTeamConfig } from '../config/teams';
import type { TeamType, TeamContext as TeamContextType } from '../types/team';

export const useTeamFromURL = (): TeamContextType => {
  const { team } = useParams<{ team: TeamType }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine the current team from URL or default to youth
  const currentTeam: TeamType = useMemo(() => {
    // If we have a team param and it's valid, use it
    if (team && (team === 'youth' || team === 'adult')) {
      return team;
    }
    
    // If we're on a non-team route, default to youth
    return 'youth';
  }, [team]);

  const teamConfig = getTeamConfig(currentTeam);

  const switchTeam = (newTeam: TeamType) => {
    if (newTeam === currentTeam) return;
    
    // Get the current path without the team segment
    const pathParts = location.pathname.split('/');
    const teamIndex = pathParts.findIndex(part => part === 'team');
    
    let newPath: string;
    if (teamIndex !== -1 && teamIndex + 1 < pathParts.length) {
      // Replace the team type in the existing team path
      pathParts[teamIndex + 1] = newTeam;
      newPath = pathParts.join('/');
    } else {
      // Navigate to the new team's home page
      newPath = `/team/${newTeam}`;
    }
    
    navigate(newPath + location.search + location.hash);
  };

  // Apply team-specific CSS variables when team changes
  useEffect(() => {
    const root = document.documentElement;
    const colors = TEAM_CONFIGS[currentTeam].colors;
    
    root.style.setProperty('--team-primary', colors.primary);
    root.style.setProperty('--team-secondary', colors.secondary);
    root.style.setProperty('--team-accent', colors.accent);
    root.style.setProperty('--team-background', colors.background);
  }, [currentTeam]);

  return {
    currentTeam,
    teamConfig,
    switchTeam,
    isLoading: false
  };
};