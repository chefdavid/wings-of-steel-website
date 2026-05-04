// Backfill player_game_stats from tmp/parsed-stats.json (LLM-parsed summaries).
// Idempotent: uses ON CONFLICT (player_id, game_highlight_id) to upsert.
// Run AFTER `supabase/player-game-stats-setup.sql` has been applied.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

for (const key of ['SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_URL']) {
  if (!process.env[key]) {
    process.env[key] = execSync(`netlify env:get ${key}`, { encoding: 'utf8' }).trim();
  }
}

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const parsed = JSON.parse(readFileSync('tmp/parsed-stats.json', 'utf8'));

// Build upsert rows. Skip scorers with no resolved player_id (unmatched names)
// and skip rows where both goals and assists are 0.
const rows = [];
const skipped = { unmatched: 0, zero: 0 };
const duplicates = [];

// Detect duplicate-content highlights: same scorers + same final_score across 2+ highlights.
const fingerprint = (s) =>
  `${s.final_score}|${s.scorers
    .map((p) => `${p.player_id}:${p.goals}:${p.assists}`)
    .sort()
    .join(',')}`;

const seenFingerprints = new Map();
for (const s of parsed.stats) {
  if (!s.scorers || s.scorers.length === 0) continue;
  const fp = fingerprint(s);
  if (seenFingerprints.has(fp)) {
    duplicates.push({ kept: seenFingerprints.get(fp), duplicate: s.highlight_id, title: s.highlight_title });
  } else {
    seenFingerprints.set(fp, s.highlight_id);
  }
}

for (const stat of parsed.stats) {
  for (const sc of stat.scorers || []) {
    if (!sc.player_id) {
      skipped.unmatched++;
      continue;
    }
    if ((sc.goals || 0) === 0 && (sc.assists || 0) === 0) {
      skipped.zero++;
      continue;
    }
    rows.push({
      player_id: sc.player_id,
      game_highlight_id: stat.highlight_id,
      goals: sc.goals || 0,
      assists: sc.assists || 0,
      notes: sc.evidence ? `[backfilled from summary] ${sc.evidence}` : '[backfilled from summary]',
    });
  }
}

console.log(`Prepared ${rows.length} rows for upsert.`);
console.log(`Skipped ${skipped.unmatched} unmatched-player rows, ${skipped.zero} all-zero rows.`);
if (duplicates.length > 0) {
  console.log(`\nWARNING: ${duplicates.length} likely-duplicate highlight(s) detected (same scorers + score):`);
  for (const d of duplicates) {
    console.log(`  - ${d.title}`);
    console.log(`    kept: ${d.kept}`);
    console.log(`    dupe: ${d.duplicate}  (also got the same stats — review in admin)`);
  }
}

// Upsert in chunks of 100.
let inserted = 0;
const chunk = 100;
for (let i = 0; i < rows.length; i += chunk) {
  const batch = rows.slice(i, i + chunk);
  const { error, count } = await supabase
    .from('player_game_stats')
    .upsert(batch, { onConflict: 'player_id,game_highlight_id', count: 'exact' });

  if (error) {
    console.error(`\nUpsert error on batch ${i}-${i + batch.length}:`);
    console.error(JSON.stringify(error, null, 2));
    if (error.code === '42P01' || /relation .* does not exist/i.test(error.message || '')) {
      console.error('\n>>> The player_game_stats table does not exist yet.');
      console.error('>>> Run supabase/player-game-stats-setup.sql in the Supabase SQL editor first.');
    }
    process.exit(1);
  }
  inserted += count ?? batch.length;
}

console.log(`\n✅ Upserted ${inserted} rows into player_game_stats.`);

// Print top scorers as sanity check.
const { data: totals } = await supabase
  .from('player_season_totals')
  .select('first_name, last_name, jersey_number, goals, assists, points, games_with_stats')
  .gt('points', 0)
  .order('points', { ascending: false })
  .limit(10);

if (totals && totals.length > 0) {
  console.log('\nTop scorers (from player_season_totals view):');
  for (const t of totals) {
    console.log(`  #${t.jersey_number ?? '?'}  ${t.first_name} ${t.last_name}: ${t.goals}G ${t.assists}A ${t.points}P (${t.games_with_stats} games)`);
  }
}
