export interface SiteSection {
  id: string;
  section_key: string;
  title?: string;
  content: Record<string, unknown>;
  updated_at: string;
}

export interface ContactInfo {
  type: 'parent' | 'guardian' | 'other' | 'self';
  name: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  relationship: string;
  primary: boolean;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface MedicalInfo {
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
  notes?: string;
}

export interface Player {
  id: string;
  name: string; // Keep for backwards compatibility
  first_name: string;
  last_name: string;
  age?: number; // Keep for backwards compatibility, calculated from birthdate
  birthdate: string; // ISO date string
  start_date: string; // ISO date string - when player joined team
  position: string;
  bio: string;
  image_url?: string;
  jersey_number: number;
  tags?: string[];
  active?: boolean;
  contacts?: ContactInfo[];
  emergency_contact?: EmergencyContact;
  medical_info?: MedicalInfo;
  player_notes?: string; // Notes about player's disabilities, special needs, coaching notes, etc.
}

export interface Coach {
  id: string;
  name: string; // Keep for backwards compatibility
  first_name: string;
  last_name: string;
  role: string; // "Head Coach", "Assistant Coach", etc.
  description: string;
  experience?: string;
  achievements?: string[];
  image_url?: string;
  start_date: string; // ISO date string - when coach joined team
  contacts?: ContactInfo[];
  emergency_contact?: EmergencyContact;
  coach_notes?: string; // Notes about coach - certifications, specialties, etc.
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  date: string;
  opponent: string;
  location: string;
  home_game: boolean;
  notes?: string;
  status: "Scheduled" | "Cancelled" | "Complete";
}