import { execSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

for (const k of ['SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_URL']) {
  if (!process.env[k]) process.env[k] = execSync(`netlify env:get ${k}`, { encoding: 'utf8' }).trim();
}
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Check the join shape: highlights -> games
const { data: hl } = await supabase
  .from('game_highlights')
  .select('id, title, opponent, game_date, final_score, game_id, game:games(id, opponent, game_date)')
  .limit(25);

console.log('=== game_highlights with games join ===\n');
for (const h of hl || []) {
  const realDate = h.game?.game_date || h.game_date || null;
  const realOpp = h.game?.opponent || h.opponent || null;
  const flag = !realDate ? ' [NO DATE]' : !realOpp ? ' [NO OPP]' : '';
  console.log(`${flag.padEnd(11)} ${(realDate||'????-??-??')}  vs ${(realOpp||'???').padEnd(20)}  | game_id=${h.game_id ? 'SET' : 'NULL'} | "${(h.title||'').slice(0,50)}"`);
}

console.log('\n=== highlights with neither date source ===');
let noDateCount = 0;
for (const h of hl || []) {
  const realDate = h.game?.game_date || h.game_date;
  if (!realDate) { noDateCount++; console.log(`- ${h.id} | game_id=${h.game_id} | "${(h.title||'').slice(0,60)}"`); }
}
console.log(`\nTotal highlights missing both date sources: ${noDateCount}/${hl?.length}`);
