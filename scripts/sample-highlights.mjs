import { execSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

const need = ['SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_URL'];
for (const key of need) {
  if (process.env[key]) continue;
  process.env[key] = execSync(`netlify env:get ${key}`, { encoding: 'utf8' }).trim();
}

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data: highlights } = await supabase
  .from('game_highlights')
  .select('id, game_id, opponent, game_date, title, summary, final_score, key_moments, player_highlights, is_published')
  .order('game_date', { ascending: false })
  .limit(50);

console.log(`Total highlights: ${highlights?.length}\n`);

for (const h of highlights || []) {
  console.log('==='.repeat(20));
  console.log(`GAME: ${h.title || h.opponent} | ${h.game_date} | score=${h.final_score}`);
  console.log(`SUMMARY: ${(h.summary || '').slice(0, 400)}${(h.summary||'').length > 400 ? '...[truncated]' : ''}`);
  if (h.key_moments?.length) {
    console.log('KEY MOMENTS:');
    for (const m of h.key_moments) console.log(`  [${m.time}] ${m.description}`);
  }
  if (h.player_highlights?.length) {
    console.log('PLAYER HIGHLIGHTS:');
    for (const p of h.player_highlights) console.log(`  • ${p.player_name}: ${p.achievement}`);
  }
}

// Also list current roster
const { data: roster } = await supabase
  .from('players')
  .select('first_name, last_name, jersey_number, position, active')
  .order('jersey_number');

console.log('\n\n=== ROSTER ===');
for (const p of roster || []) {
  console.log(`#${p.jersey_number ?? '?'} ${p.first_name} ${p.last_name} (${p.position}) active=${p.active}`);
}
