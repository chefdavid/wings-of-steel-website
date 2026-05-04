// Seed gamesheet_player_id + gamesheet_season_id on players from the
// recon-discovered championship-event roster (season 14654). Wings players
// not in this list have their fields left null; the modal then falls back
// to the team URL.
import { execSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

for (const k of ['SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_URL']) {
  if (!process.env[k]) process.env[k] = execSync(`netlify env:get ${k}`, { encoding: 'utf8' }).trim();
}
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const SEASON = '14654';
// Match by last_name (case-insensitive). For Ashby we target Jack (defense).
const mapping = [
  { last_name: 'Wiederholt', id: '7943115' },
  { last_name: 'Gonzales', id: '7943108' },
  { last_name: 'Haas', id: '7943112' },
  { last_name: 'Donzuso', id: '7943111' },
  { last_name: 'Marmino', id: '7943113' },
  { last_name: 'Naylor', id: '7943114' },
  { last_name: 'Ashby', id: '7943110', first_name_starts: 'Jack' },
  { last_name: 'Carmen', id: '7943116' },
];

let updated = 0;
const skipped = [];

for (const m of mapping) {
  let q = supabase
    .from('players')
    .update({ gamesheet_player_id: m.id, gamesheet_season_id: SEASON })
    .ilike('last_name', m.last_name);
  if (m.first_name_starts) q = q.ilike('first_name', `${m.first_name_starts}%`);
  const { data, error } = await q.select('id, first_name, last_name, jersey_number');
  if (error) {
    skipped.push({ ...m, error: error.message });
  } else if (!data || data.length === 0) {
    skipped.push({ ...m, error: 'no roster match' });
  } else {
    for (const p of data) {
      console.log(`✓ #${p.jersey_number} ${p.first_name} ${p.last_name} → gamesheet ${m.id}`);
      updated++;
    }
  }
}

console.log(`\nUpdated ${updated} player(s).`);
if (skipped.length > 0) {
  console.log(`Skipped: ${skipped.length}`);
  for (const s of skipped) console.log(`  - ${s.last_name}: ${s.error}`);
}
