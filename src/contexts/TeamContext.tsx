import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { TeamType, TeamContext as TeamContextType } from '../types/team';
import { TEAM_CONFIGS, getTeamConfig } from '../config/teams';

interface TeamProviderProps {
  children: ReactNode;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<TeamProviderProps> = ({ children }) => {
  const [currentTeam, setCurrentTeam] = useState<TeamType>('youth'); // Default to youth
  const [isLoading, setIsLoading] = useState(false);

  // Get team config based on current team
  const teamConfig = getTeamConfig(currentTeam);

  const switchTeam = async (team: TeamType) => {
    if (team === currentTeam) return;
    
    setIsLoading(true);
    try {
      setCurrentTeam(team);
      // Store team preference in localStorage
      localStorage.setItem('wings-team-preference', team);
      
      // Apply team-specific CSS variables to document root
      const root = document.documentElement;
      const colors = TEAM_CONFIGS[team].colors;
      
      root.style.setProperty('--team-primary', colors.primary);
      root.style.setProperty('--team-secondary', colors.secondary);
      root.style.setProperty('--team-accent', colors.accent);
      root.style.setProperty('--team-background', colors.background);
      
    } catch (error) {
      console.error('Error switching teams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize team on mount
  useEffect(() => {
    const savedTeam = localStorage.getItem('wings-team-preference') as TeamType;
    if (savedTeam && (savedTeam === 'youth' || savedTeam === 'adult')) {
      setCurrentTeam(savedTeam);
    }
    
    // Set initial CSS variables
    const colors = TEAM_CONFIGS[currentTeam].colors;
    const root = document.documentElement;
    root.style.setProperty('--team-primary', colors.primary);
    root.style.setProperty('--team-secondary', colors.secondary);
    root.style.setProperty('--team-accent', colors.accent);
    root.style.setProperty('--team-background', colors.background);
  }, [currentTeam]);

  const contextValue: TeamContextType = {
    currentTeam,
    teamConfig,
    switchTeam,
    isLoading
  };

  return (
    <TeamContext.Provider value={contextValue}>
      {children}
    </TeamContext.Provider>
  );
};

// Export the context for use in the separate useTeam hook
export { TeamContext };