import React, { createContext } from 'react';
import type { ReactNode } from 'react';
import type { TeamContext as TeamContextType } from '../types/team';
import { useTeamFromURL } from '../hooks/useTeamFromURL';

interface TeamProviderProps {
  children: ReactNode;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const URLTeamProvider: React.FC<TeamProviderProps> = ({ children }) => {
  const teamContextValue = useTeamFromURL();

  return (
    <TeamContext.Provider value={teamContextValue}>
      {children}
    </TeamContext.Provider>
  );
};

// Export the context for use in the useTeam hook
export { TeamContext };