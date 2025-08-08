import { useContext } from 'react';
import { TeamContext } from '../contexts/URLTeamContext';
import type { TeamContext as TeamContextType } from '../types/team';

export const useTeam = (): TeamContextType => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a URLTeamProvider');
  }
  return context;
};