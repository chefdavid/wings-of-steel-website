// Verifies that every 2026-2027 date lands on the day of the week the source
// document says it does.
//
// Run with: npx tsx src/scripts/verify-schedule-2026-2027.ts
//
// Why this exists: past imports drifted by a day because a YYYY-MM-DD string was
// handed to `new Date()` (parsed as UTC midnight) and then read back in local
// time, which is the previous evening anywhere west of Greenwich. Every check
// below computes the weekday three independent ways and refuses to agree with
// itself unless all three match:
//
//   1. UTC arithmetic on the raw Y/M/D - no timezone involved at all
//   2. local midnight  -> `new Date(d + 'T00:00:00')`, what the components use
//   3. local noon      -> `new Date(d + 'T12:00:00')`, the belt-and-braces form
//
// If (1) and (2) ever disagree, a component is about to render the wrong day.

import { schedule2026_2027, practices2026_2027 } from '../data/schedule-2026-2027';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Expected weekday for each game date, taken from the "Day" column of Games 2026.2027.xlsx. */
const EXPECTED_GAME_DAYS: Record<string, string> = {
  '2026-09-27': 'Sunday',
  '2026-10-10': 'Saturday',
  '2026-11-07': 'Saturday',
  '2026-11-14': 'Saturday',
  '2026-11-22': 'Sunday',
  '2026-11-28': 'Saturday',
  '2026-12-20': 'Sunday',
  '2027-01-30': 'Saturday',
  '2027-02-14': 'Sunday',
  '2027-02-20': 'Saturday',
  '2027-02-27': 'Saturday',
  '2027-02-28': 'Sunday',
  '2027-03-21': 'Sunday'
};

/** The practice flyer lists every session as "Thu". */
const EXPECTED_PRACTICE_DAY = 'Thursday';

interface DayCheck {
  utc: string;
  localMidnight: string;
  localNoon: string;
  consistent: boolean;
}

function weekdayThreeWays(dateStr: string): DayCheck {
  const [y, m, d] = dateStr.split('-').map(Number);

  // 1. Pure UTC arithmetic - no local timezone can touch this.
  const utc = DAY_NAMES[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];

  // 2. Exactly how the site parses dates (Schedule.tsx, Location.tsx, PracticeSchedule.tsx).
  const localMidnight = new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long' });

  // 3. Noon - immune to +/-12h shifts, so it flags a bad parse in (2).
  const localNoon = new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' });

  return {
    utc,
    localMidnight,
    localNoon,
    consistent: utc === localMidnight && utc === localNoon
  };
}

function pad(s: string, n: number) {
  return s.length >= n ? s : s + ' '.repeat(n - s.length);
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

let failures = 0;

function checkDate(dateStr: string, expected: string, label: string) {
  const check = weekdayThreeWays(dateStr);

  if (!check.consistent) {
    failures++;
    console.log(`❌ ${dateStr}  TIMEZONE DRIFT - utc=${check.utc} localMidnight=${check.localMidnight} localNoon=${check.localNoon}`);
    console.log(`   ${label}`);
    return;
  }

  if (check.utc !== expected) {
    failures++;
    console.log(`❌ ${dateStr}  is a ${check.utc}, but the source says ${expected}`);
    console.log(`   ${label}`);
    return;
  }

  console.log(`✅ ${dateStr}  ${pad(check.utc, 9)} ${label}`);
}

console.log(`Local timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
console.log(`Node offset:    UTC${-new Date().getTimezoneOffset() / 60 >= 0 ? '+' : ''}${-new Date().getTimezoneOffset() / 60}\n`);

console.log('=== Games (source: Games 2026.2027.xlsx) ===\n');
schedule2026_2027.forEach(game => {
  const expected = EXPECTED_GAME_DAYS[game.game_date];
  if (!expected) {
    failures++;
    console.log(`❌ ${game.game_date}  has no expected weekday recorded in this script`);
    return;
  }
  const side = game.home_away === 'home' ? 'HOME' : 'AWAY';
  checkDate(game.game_date, expected, `${pad(formatTime(game.game_time), 8)} ${pad(side, 4)} vs ${pad(game.opponent ?? '', 22)} @ ${game.location}`);
});

console.log('\n=== Practices (source: 2026-2027 practice flyer) ===\n');
practices2026_2027.forEach(practice => {
  const date = practice.practice_date!;
  checkDate(
    date,
    EXPECTED_PRACTICE_DAY,
    `${pad(`${formatTime(practice.start_time)} - ${formatTime(practice.end_time)}`, 20)} ${practice.rink}`
  );

  // The stored day_of_week / day_order must agree with the real calendar day,
  // because the /practice-schedule calendar paints dots from day_of_week alone.
  const actual = weekdayThreeWays(date).utc;
  if (practice.day_of_week !== actual) {
    failures++;
    console.log(`   ❌ day_of_week is "${practice.day_of_week}" but ${date} is a ${actual}`);
  }
  if (practice.day_order !== DAY_NAMES.indexOf(actual)) {
    failures++;
    console.log(`   ❌ day_order is ${practice.day_order} but ${actual} is index ${DAY_NAMES.indexOf(actual)} (Sunday=0)`);
  }
  // effective_from / effective_to must mirror practice_date or the public page hides it.
  if (practice.effective_from !== date || practice.effective_to !== date) {
    failures++;
    console.log(`   ❌ effective_from/${practice.effective_from} effective_to/${practice.effective_to} do not match practice_date/${date}`);
  }
});

console.log('\n=== Summary ===');
console.log(`Games:     ${schedule2026_2027.length} (${schedule2026_2027.filter(g => g.home_away === 'home').length} home, ${schedule2026_2027.filter(g => g.home_away === 'away').length} away)`);
console.log(`Practices: ${practices2026_2027.length}`);

if (failures === 0) {
  console.log('\n✅ Every date matches its source document, in all three parsings.');
} else {
  console.log(`\n❌ ${failures} problem(s) found.`);
  process.exit(1);
}
