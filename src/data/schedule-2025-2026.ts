import type { Game } from '../types/database';

// Wings of Steel 2025-2026 Season Schedule
// Note: All home games are at Flyers Skate Zone unless otherwise noted

export const schedule2025_2026: Omit<Game, 'id'>[] = [
  // October 2025
  {
    game_date: '2025-10-05',
    game_time: '14:40',
    opponent: 'Hammerheads',
    location: 'Skate Zone NE',
    home_away: 'away',
    season: '2025-2026',
    is_active: true
  },
  {
    game_date: '2025-10-11',
    game_time: '10:45',
    opponent: 'Sled Stars',
    location: 'Hollydell Ice Arena',
    home_away: 'away',
    season: '2025-2026',
    is_active: true
  },
  {
    game_date: '2025-10-18',
    game_time: '13:20',
    opponent: 'Sled Stars',
    location: 'Flyers Skate Zone',
    home_away: 'home',
    season: '2025-2026',
    is_active: true
  },
  {
    game_date: '2025-10-19',
    game_time: '13:20',
    opponent: 'TBD',
    location: 'Flyers Skate Zone',
    home_away: 'home',
    season: '2025-2026',
    is_active: true
  },

  // November 2025
  {
    game_date: '2025-11-16',
    game_time: '13:20',
    opponent: 'Bennett Blazers',
    location: 'Flyers Skate Zone',
    home_away: 'home',
    season: '2025-2026',
    is_active: true
  },
  {
    game_date: '2025-11-29',
    game_time: '13:20',
    opponent: 'Hammerheads',
    location: 'Flyers Skate Zone',
    home_away: 'home',
    season: '2025-2026',
    is_active: true
  },

  // December 2025
  {
    game_date: '2025-12-21',
    game_time: '13:20',
    opponent: 'Family Game',
    location: 'Flyers Skate Zone',
    home_away: 'home',
    notes: 'Holiday Party',
    season: '2025-2026',
    is_active: true
  },

  // January 2026
  {
    game_date: '2026-01-11',
    game_time: '14:40',
    opponent: 'Hammerheads',
    location: 'Skate Zone NE',
    home_away: 'away',
    season: '2025-2026',
    is_active: true
  },
  {
    game_date: '2026-01-31',
    game_time: '10:40',
    opponent: 'Sled Stars',
    location: 'Hollydell Ice Arena',
    home_away: 'away',
    season: '2025-2026',
    is_active: true
  },

  // February 2026
  {
    game_date: '2026-02-07',
    game_time: '18:10',
    opponent: 'Bennett Blazers',
    location: 'Ice World',
    home_away: 'away',
    season: '2025-2026',
    is_active: true
  },
  {
    game_date: '2026-02-15',
    game_time: '13:20',
    opponent: 'TBD',
    location: 'Flyers Skate Zone',
    home_away: 'home',
    season: '2025-2026',
    is_active: true
  },
  {
    game_date: '2026-02-21',
    game_time: '13:20',
    opponent: 'Sled Stars',
    location: 'Flyers Skate Zone',
    home_away: 'home',
    season: '2025-2026',
    is_active: true
  },
  {
    game_date: '2026-02-28',
    game_time: '09:00',
    opponent: 'TBD',
    location: 'Flyers Skate Zone',
    home_away: 'home',
    season: '2025-2026',
    is_active: true
  },
  {
    game_date: '2026-02-28',
    game_time: '14:30',
    opponent: 'TBD',
    location: 'Flyers Skate Zone',
    home_away: 'home',
    season: '2025-2026',
    is_active: true
  },

  // March 2026
  {
    game_date: '2026-03-01',
    game_time: '13:20',
    opponent: 'DC Sled Sharks',
    location: 'Flyers Skate Zone',
    home_away: 'home',
    season: '2025-2026',
    is_active: true
  },
  {
    game_date: '2026-03-22',
    game_time: '13:20',
    opponent: 'Gloucester Catholic',
    location: 'Flyers Skate Zone',
    home_away: 'home',
    game_type: 'Exhibition',
    notes: 'Hockey for a Cause — Entry by Donation. Basket auction on-site!',
    season: '2025-2026',
    is_active: true
  }
];

// Rink addresses for reference
export const rinkAddresses = {
  'Hammerheads': 'Skate Zone NE, 10990 Decatur Rd, Philadelphia, PA 19154',
  'Sled Stars': 'Hollydell Ice Arena, 601 Holly Dell Dr, Sewell, NJ 08080',
  'Bennett Blazers': 'Ice World, 1300 Governor Court, Abington, MD 21009',
  'DC Sharks': 'Kettler Capitals Ice Plex, 627 N. Glebe Rd, Suite 800, Arlington, VA 22203',
  'Flyers Skate Zone': '601 Laurel Oak Rd, Voorhees Township, NJ 08043'
};

// Optional tournaments (not included in main schedule)
export const optionalTournaments = [
  {
    dates: '2026-03-27 to 2026-03-29',
    event: 'Amelia Park Tournament',
    location: 'Westfield, MA',
    notes: 'Optional'
  },
  {
    dates: '2026-04-30 to 2026-05-03',
    event: 'USA Hockey Tournament',
    location: 'Dallas, TX',
    notes: 'Optional'
  }
];