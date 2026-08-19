// Diffs what is actually in Supabase against src/data/schedule-2026-2027.ts.
//
// The verify script proves the data file is internally correct. This one proves
// the database agrees with it - including that Postgres stored the same
// calendar day, which is where past imports went wrong.
//
// Run with: npx tsx src/scripts/check-schedule-db.ts

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { schedule2026_2027, practices2026_2027, SEASON_LABEL } from '../data/schedule-2026-2027';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const weekday = (d: string) => {
  const [y, m, day] = d.split('-').map(Number);
  return DAY_NAMES[new Date(Date.UTC(y, m - 1, day)).getUTCDay()];
};
const hhmm = (t: string | null) => (t || '').slice(0, 5);

let problems = 0;
const fail = (msg: string) => { problems++; console.log(`❌ ${msg}`); };

async function checkGames() {
  console.log(`\n=== Games in game_schedules for ${SEASON_LABEL} ===\n`);

  const { data, error } = await supabase
    .from('game_schedules')
    .select('id, game_date, game_time, opponent, location, home_away, game_type, notes, season, season_id')
    .eq('season', SEASON_LABEL)
    .order('game_date')
    .order('game_time');

  if (error) { fail(`Could not read games: ${error.message}`); return; }

  const rows = data || [];
  console.log(`${rows.length} rows in database, ${schedule2026_2027.length} in the data file`);

  const byKey = new Map(rows.map(r => [`${r.game_date}|${hhmm(r.game_time)}`, r]));

  for (const game of schedule2026_2027) {
    const key = `${game.game_date}|${game.game_time}`;
    const row = byKey.get(key);

    if (!row) { fail(`Missing from database: ${game.game_date} ${game.game_time} vs ${game.opponent}`); continue; }
    byKey.delete(key);

    if (row.opponent !== game.opponent) fail(`${key} opponent: db="${row.opponent}" file="${game.opponent}"`);
    if (row.location !== game.location) fail(`${key} location: db="${row.location}" file="${game.location}"`);
    if (row.home_away !== game.home_away) fail(`${key} home_away: db="${row.home_away}" file="${game.home_away}"`);
    if ((row.notes || null) !== (game.notes || null)) fail(`${key} notes differ`);
    if (!row.season_id) fail(`${key} has no season_id`);

    console.log(`✅ ${row.game_date}  ${weekday(row.game_date).padEnd(9)} ${hhmm(row.game_time)}  ${(row.home_away || '').padEnd(4)} vs ${row.opponent}`);
  }

  for (const [key, row] of byKey) {
    fail(`In database but not in the data file: ${key} vs ${row.opponent} (id ${row.id})`);
  }
}

async function checkPractices() {
  console.log(`\n=== Practices in practice_schedules for ${SEASON_LABEL} ===\n`);

  const { data, error } = await supabase
    .from('practice_schedules')
    .select('id, practice_date, effective_from, effective_to, day_of_week, day_order, start_time, end_time, rink, location, description, team_type, season, season_id, is_active')
    .eq('season', SEASON_LABEL)
    .order('practice_date');

  if (error) { fail(`Could not read practices: ${error.message}`); return; }

  const rows = data || [];
  console.log(`${rows.length} rows in database, ${practices2026_2027.length} in the data file`);

  const byDate = new Map(rows.map(r => [r.practice_date as string, r]));

  for (const practice of practices2026_2027) {
    const date = practice.practice_date!;
    const row = byDate.get(date);

    if (!row) { fail(`Missing from database: ${date}`); continue; }
    byDate.delete(date);

    const expectedDay = weekday(date);
    if (row.day_of_week !== expectedDay) fail(`${date} day_of_week: db="${row.day_of_week}" actual="${expectedDay}"`);
    if (hhmm(row.start_time) !== practice.start_time) fail(`${date} start_time: db="${hhmm(row.start_time)}" file="${practice.start_time}"`);
    if (hhmm(row.end_time) !== practice.end_time) fail(`${date} end_time: db="${hhmm(row.end_time)}" file="${practice.end_time}"`);
    if (row.rink !== practice.rink) fail(`${date} rink: db="${row.rink}" file="${practice.rink}"`);
    if (row.description !== practice.description) fail(`${date} description differs`);
    // The reason the earlier 2026-27 practices never appeared on the site.
    if (row.effective_from !== date) fail(`${date} effective_from is "${row.effective_from}" - the home page will not show this practice`);
    if (row.effective_to !== date) fail(`${date} effective_to is "${row.effective_to}" - /practice-schedule will not show this practice`);
    if (!row.is_active) fail(`${date} is_active is false`);
    if (!row.season_id) fail(`${date} has no season_id`);

    console.log(`✅ ${date}  ${expectedDay.padEnd(9)} ${hhmm(row.start_time)}-${hhmm(row.end_time)}  ${row.rink}`);
  }

  for (const [date, row] of byDate) {
    fail(`In database but not in the data file: ${date} (id ${row.id})`);
  }
}

(async () => {
  await checkGames();
  await checkPractices();

  console.log('\n=== Summary ===');
  if (problems === 0) {
    console.log('✅ Database matches the data file exactly, and every weekday is correct.');
  } else {
    console.log(`❌ ${problems} mismatch(es) between the database and the data file.`);
    process.exit(1);
  }
})();
