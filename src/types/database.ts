export interface SiteSection {
  id: string;
  section_key: string;
  title?: string;
  content: Record<string, unknown>;
  updated_at: string;
}

export interface Player {
  id: string;
  name: string;
  age: number;
  position: string;
  bio: string;
  image_url?: string;
  jersey_number: number;
  tags?: string[];
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