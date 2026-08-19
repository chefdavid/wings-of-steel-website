import type { Game } from '../types/database';
import type { PracticeSchedule } from '../types/practice-schedule';

// Wings of Steel 2026-2027 Season
//
// Games come from "Games 2026.2027.xlsx" (league master schedule).
// Practices come from the 2026-2027 team practice flyer.
//
// Every date below has been verified against its intended day of the week by
// `npm run verify:schedule`. Dates are plain YYYY-MM-DD
// strings and are always parsed as `new Date(d + 'T00:00:00')` (local midnight)
// so they can never roll back a day through a UTC conversion.

export const SEASON_LABEL = '2026-27';

/** The three ice surfaces the team uses inside the Flyers Skate Zone complex. */
export const HOME_RINK = 'Flyers Skate Zone';

// ---------------------------------------------------------------- games

export const schedule2026_2027: Omit<Game, 'id'>[] = [
  // September 2026
  {
    game_date: '2026-09-27', // Sunday
    game_time: '14:40',
    opponent: 'Hammerheads',
    location: 'Skate Zone NE',
    home_away: 'away',
    game_type: 'Regular',
    season: SEASON_LABEL,
    is_active: true
  },

  // October 2026
  {
    game_date: '2026-10-10', // Saturday
    game_time: '12:10',
    opponent: 'Bennett Blazers',
    location: HOME_RINK,
    home_away: 'home',
    game_type: 'Regular',
    notes: 'Played on Flyers Ice. Bennett Blazers are the designated home team.',
    season: SEASON_LABEL,
    is_active: true
  },

  // November 2026
  {
    game_date: '2026-11-07', // Saturday
    game_time: '12:00',
    opponent: 'Hammerheads',
    location: HOME_RINK,
    home_away: 'home',
    game_type: 'Regular',
    notes: 'Phantoms Ice surface.',
    season: SEASON_LABEL,
    is_active: true
  },
  {
    game_date: '2026-11-14', // Saturday
    game_time: '12:00',
    opponent: 'Vineland Sled Stars',
    location: HOME_RINK,
    home_away: 'home',
    game_type: 'Regular',
    notes: 'Phantoms Ice surface.',
    season: SEASON_LABEL,
    is_active: true
  },
  {
    game_date: '2026-11-22', // Sunday
    game_time: '14:40',
    opponent: 'Hammerheads',
    location: 'Skate Zone NE',
    home_away: 'away',
    game_type: 'Regular',
    season: SEASON_LABEL,
    is_active: true
  },
  {
    game_date: '2026-11-28', // Saturday
    game_time: '14:00',
    opponent: 'TBD',
    location: HOME_RINK,
    home_away: 'home',
    game_type: 'Regular',
    notes: 'Flyers Ice Rink. Opponent to be announced.',
    season: SEASON_LABEL,
    is_active: true
  },

  // December 2026
  {
    game_date: '2026-12-20', // Sunday
    game_time: '12:10',
    opponent: 'Wings of Steel Alumni',
    location: HOME_RINK,
    home_away: 'home',
    game_type: 'Alumni Game',
    notes: 'Annual Alumni Game on Flyers Ice Rink.',
    season: SEASON_LABEL,
    is_active: true
  },

  // January 2027
  {
    game_date: '2027-01-30', // Saturday
    game_time: '12:05',
    opponent: 'Vineland Sled Stars',
    location: 'Hollydell Ice Arena',
    home_away: 'away',
    game_type: 'Regular',
    season: SEASON_LABEL,
    is_active: true
  },

  // February 2027
  {
    game_date: '2027-02-14', // Sunday
    game_time: '15:30',
    opponent: 'TBD',
    location: HOME_RINK,
    home_away: 'home',
    game_type: 'Regular',
    notes: 'Flyers Ice. Opponent to be announced.',
    season: SEASON_LABEL,
    is_active: true
  },
  {
    game_date: '2027-02-20', // Saturday
    game_time: '14:00',
    opponent: 'TBD',
    location: HOME_RINK,
    home_away: 'home',
    game_type: 'Regular',
    notes: 'Flyers Ice. Opponent to be announced.',
    season: SEASON_LABEL,
    is_active: true
  },
  {
    game_date: '2027-02-27', // Saturday
    game_time: '09:00',
    opponent: 'TBD',
    location: HOME_RINK,
    home_away: 'home',
    game_type: 'Regular',
    notes: 'Flyers Ice. New York opponent, to be confirmed. Game 1 of a doubleheader.',
    season: SEASON_LABEL,
    is_active: true
  },
  {
    game_date: '2027-02-27', // Saturday
    game_time: '14:30',
    opponent: 'TBD',
    location: HOME_RINK,
    home_away: 'home',
    game_type: 'Regular',
    notes: 'Flyers Ice. New York opponent, to be confirmed. Game 2 of a doubleheader.',
    season: SEASON_LABEL,
    is_active: true
  },
  {
    game_date: '2027-02-28', // Sunday
    game_time: '14:00',
    opponent: 'TBD',
    location: HOME_RINK,
    home_away: 'home',
    game_type: 'Regular',
    notes: 'Flyers Ice. Opponent to be announced.',
    season: SEASON_LABEL,
    is_active: true
  },

  // March 2027
  {
    game_date: '2027-03-21', // Sunday
    game_time: '14:00',
    opponent: 'Hammerheads',
    location: HOME_RINK,
    home_away: 'home',
    game_type: 'Regular',
    notes: 'Flyers Ice.',
    season: SEASON_LABEL,
    is_active: true
  }
];

// ------------------------------------------------------------ practices

type SeasonPractice = Omit<PracticeSchedule, 'id'>;

/**
 * Every practice is a Thursday. `practice_date`, `effective_from` and
 * `effective_to` are all set to the same day on purpose: the admin screen reads
 * `practice_date`, the /practice-schedule page filters on `effective_to`, and
 * the home page Location section renders `effective_from`. Writing all three
 * keeps a practice visible everywhere instead of only in the admin.
 */
export const practices2026_2027: SeasonPractice[] = [
  // September 2026 - preseason
  { practice_date: '2026-09-03', start_time: '16:30', end_time: '17:30', rink: 'Flyers Ice Rink', description: 'Preseason Practice' },
  { practice_date: '2026-09-10', start_time: '18:10', end_time: '19:10', rink: 'Rink #3', description: 'Preseason Practice' },
  { practice_date: '2026-09-17', start_time: '16:30', end_time: '17:30', rink: 'Rink #3', description: 'Preseason Practice' },
  { practice_date: '2026-09-24', start_time: '16:00', end_time: '17:00', rink: 'Rink #3', description: 'Preseason Practice' },

  // October 2026
  { practice_date: '2026-10-01', start_time: '18:10', end_time: '19:10', rink: 'Rink #3', description: 'Regular Season Practice' },
  { practice_date: '2026-10-08', start_time: '18:10', end_time: '19:10', rink: 'Rink #3', description: 'Regular Season Practice' },
  { practice_date: '2026-10-22', start_time: '18:10', end_time: '19:10', rink: 'Rink #3', description: 'Regular Season Practice' },
  { practice_date: '2026-10-29', start_time: '18:10', end_time: '19:10', rink: 'Rink #3', description: 'Regular Season Practice' },

  // November 2026
  { practice_date: '2026-11-05', start_time: '18:10', end_time: '19:10', rink: 'Rink #3', description: 'Regular Season Practice' },
  { practice_date: '2026-11-12', start_time: '18:10', end_time: '19:10', rink: 'Rink #3', description: 'Regular Season Practice' },
  { practice_date: '2026-11-19', start_time: '18:10', end_time: '19:10', rink: 'Rink #3', description: 'Regular Season Practice' },

  // December 2026
  { practice_date: '2026-12-03', start_time: '18:10', end_time: '19:10', rink: 'Rink #3', description: 'Regular Season Practice' },
  { practice_date: '2026-12-10', start_time: '18:10', end_time: '19:10', rink: 'Rink #3', description: 'Regular Season Practice' },
  { practice_date: '2026-12-17', start_time: '18:10', end_time: '19:10', rink: 'Rink #3', description: 'Last Practice Before Holiday Break' },

  // January 2027
  { practice_date: '2027-01-07', start_time: '18:10', end_time: '19:10', rink: 'Rink #3', description: 'First Practice After Holiday Break' },
  { practice_date: '2027-01-14', start_time: '18:10', end_time: '19:10', rink: 'Rink #3', description: 'Regular Season Practice' },
  { practice_date: '2027-01-21', start_time: '18:10', end_time: '19:10', rink: 'Rink #3', description: 'Regular Season Practice' },
  { practice_date: '2027-01-28', start_time: '18:10', end_time: '19:10', rink: 'Rink #3', description: 'Regular Season Practice' },

  // February 2027
  { practice_date: '2027-02-04', start_time: '18:10', end_time: '19:10', rink: 'Rink #3', description: 'Regular Season Practice' },
  { practice_date: '2027-02-11', start_time: '18:10', end_time: '19:10', rink: 'Rink #3', description: 'Regular Season Practice' },
  { practice_date: '2027-02-18', start_time: '18:10', end_time: '19:10', rink: 'Rink #3', description: 'Regular Season Practice' },
  { practice_date: '2027-02-25', start_time: '18:10', end_time: '19:10', rink: 'Rink #3', description: 'Regular Season Practice' },

  // March 2027
  { practice_date: '2027-03-04', start_time: '18:10', end_time: '19:10', rink: 'Rink #3', description: 'Regular Season Practice' },
  { practice_date: '2027-03-11', start_time: '18:10', end_time: '19:10', rink: 'Flyers Ice Rink', description: 'Regular Season Practice' },
  { practice_date: '2027-03-18', start_time: '18:10', end_time: '19:10', rink: 'Rink #3', description: 'Regular Season Practice' },
  { practice_date: '2027-03-25', start_time: '18:10', end_time: '19:10', rink: 'Rink #3', description: 'Regular Season Practice' },

  // April 2027 - spring
  { practice_date: '2027-04-01', start_time: '18:10', end_time: '19:10', rink: 'Phantoms Ice', description: 'Spring Practice' },
  { practice_date: '2027-04-08', start_time: '18:10', end_time: '19:10', rink: 'Phantoms Ice', description: 'Spring Practice' },
  { practice_date: '2027-04-15', start_time: '18:10', end_time: '19:10', rink: 'Phantoms Ice', description: 'Spring Practice' },
  { practice_date: '2027-04-22', start_time: '19:10', end_time: '20:10', rink: 'Phantoms Ice', description: 'Spring Practice' },

  // May - August 2027 - summer skates
  { practice_date: '2027-05-06', start_time: '18:00', end_time: '19:00', rink: 'Flyers Ice Rink', description: 'Summer Practice Session' },
  { practice_date: '2027-06-17', start_time: '18:00', end_time: '19:00', rink: 'Phantoms Ice', description: 'Summer Practice Session' },
  { practice_date: '2027-07-15', start_time: '18:00', end_time: '19:00', rink: 'Flyers Ice Rink', description: 'Summer Practice Session' },
  { practice_date: '2027-08-12', start_time: '18:00', end_time: '19:00', rink: 'Flyers Ice Rink', description: 'Summer Practice Session' }
].map(p => ({
  ...p,
  day_of_week: 'Thursday',
  day_order: 4,
  team_type: 'youth',
  location: HOME_RINK,
  season: SEASON_LABEL,
  is_active: true,
  // Same day in all three date columns - see the note above.
  effective_from: p.practice_date,
  effective_to: p.practice_date,
  notes: 'Practice times and locations are subject to change.'
}));

// ----------------------------------------------------------- tournaments

export interface SeasonTournament {
  name: string;
  dates: string;
  days: string;
  location: string;
  /** Passed to Google Maps directions. */
  destination: string;
  notes?: string;
}

/**
 * Tournaments render on the home page schedule section. The 2026-2027 league
 * sheet lists none yet, so the section hides itself. Add entries here as they
 * are confirmed - do not hardcode them into Schedule.tsx again, or they linger
 * for a year after the season ends.
 */
export const tournaments2026_2027: SeasonTournament[] = [];

// ---------------------------------------------------------------- rinks

export const rinkAddresses = {
  'Hammerheads': 'Skate Zone NE, 10990 Decatur Rd, Philadelphia, PA 19154',
  'Vineland Sled Stars': 'Hollydell Ice Arena, 601 Holly Dell Dr, Sewell, NJ 08080',
  'Bennett Blazers': 'Ice World, 1300 Governor Court, Abingdon, MD 21009',
  'DC Sled Sharks': 'Kettler Capitals Ice Plex, 627 N. Glebe Rd, Suite 800, Arlington, VA 22203',
  'Flyers Skate Zone': '601 Laurel Oak Rd, Voorhees Township, NJ 08043'
};
