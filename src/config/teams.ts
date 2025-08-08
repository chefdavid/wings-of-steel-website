import type { TeamConfig } from '../types/team';

export const TEAM_CONFIGS: Record<string, TeamConfig> = {
  youth: {
    type: 'youth',
    name: 'Wings of Steel',
    fullName: 'Wings of Steel Youth Team',
    colors: {
      primary: '#4682B4',     // steel-blue
      secondary: '#2C3E50',   // dark-steel
      accent: '#E0F4FF',      // ice-blue
      background: '#71797E'   // steel-gray
    },
    description: 'Youth sled hockey team making the sport accessible to all children',
    ageGroup: '13-17 years',
    mission: 'No child pays to play! Making sled hockey accessible to all youth regardless of financial ability.',
    stripAccountId: undefined // Will be set when Stripe integration is added
  }
  // Adult team configuration removed - will be re-added in future
};

export const getTeamConfig = (teamType: string): TeamConfig => {
  return TEAM_CONFIGS[teamType] || TEAM_CONFIGS.youth;
};

export const getTeamColors = (teamType: string) => {
  const config = getTeamConfig(teamType);
  return config.colors;
};