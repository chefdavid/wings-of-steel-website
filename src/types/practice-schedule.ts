export interface PracticeSchedule {
  id: string;
  day_of_week: string;
  day_order: number;
  start_time: string;
  end_time: string;
  team_type?: string;
  location?: string;
  rink?: string;
  description?: string;
  is_active?: boolean;
  season?: string;
  effective_from?: string;
  effective_to?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  // Formatted fields from view
  start_time_formatted?: string;
  end_time_formatted?: string;
  duration?: string;
}

export const DAYS_OF_WEEK = [
  { name: 'Monday', order: 1 },
  { name: 'Tuesday', order: 2 },
  { name: 'Wednesday', order: 3 },
  { name: 'Thursday', order: 4 },
  { name: 'Friday', order: 5 },
  { name: 'Saturday', order: 6 },
  { name: 'Sunday', order: 7 }
];

export const TEAM_TYPES = [
  { value: 'all', label: 'All Teams' },
  { value: 'youth', label: 'Youth Team' },
  { value: 'mites', label: 'Mites (8U)' },
  { value: 'squirts', label: 'Squirts (10U)' },
  { value: 'peewees', label: 'Peewees (12U)' },
  { value: 'bantams', label: 'Bantams (14U)' },
  { value: 'midgets', label: 'Midgets (16U)' },
  { value: 'juniors', label: 'Juniors (18U)' },
  { value: 'beginners', label: 'Learn to Play' },
  { value: 'adult', label: 'Adult Team' }
];