/**
 * Team system types and interfaces
 */

export type TeamType = 'youth' | 'adult';

export interface TeamConfig {
  type: TeamType;
  name: string;
  fullName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  logo?: string;
  description: string;
  ageGroup: string;
  mission: string;
  stripAccountId?: string; // For future payment integration
}

export interface TeamBranding {
  teamType: TeamType;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo?: string;
  teamName: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  team_type?: TeamType; // null = master admin, specific team = team admin
  role: 'master_admin' | 'team_admin' | 'viewer';
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface TeamContext {
  currentTeam: TeamType;
  teamConfig: TeamConfig;
  switchTeam: (team: TeamType) => void;
  isLoading: boolean;
}