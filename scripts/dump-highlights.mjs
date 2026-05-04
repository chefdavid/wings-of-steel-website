import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const need = ['SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_URL'];
for (const key of need) {
  if (process.env[key]) continue;
  process.env[key] = execSync(`netlify env:get ${key}`, { encoding: 'utf8' }).trim();
}

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data: highlights } = await supabase
  .from('game_highlights')
  .select('id, game_id, opponent, game_date, title, summary, final_score, key_moments, player_highlights')
  .order('game_date', { ascending: false, nullsFirst: false });

const { data: games } = await supabase
  .from('games')
  .select('id, opponent, game_date, location, home_away, game_type');

const { data: players } = await supabase
  .from('players')
  .select('id, first_name, last_name, jersey_number, position, active');

mkdirSync('tmp', { recursive: true });
writeFileSync('tmp/highlights-dump.json', JSON.stringify({ highlights, games, players }, null, 2));
console.log(`Wrote tmp/highlights-dump.json — ${highlights?.length} highlights, ${games?.length} games, ${players?.length} players`);
