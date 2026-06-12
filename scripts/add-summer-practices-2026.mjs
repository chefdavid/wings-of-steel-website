// Summer 2026 practice sessions: June 18, July 16, August 13 at 6:00 PM.
// Deactivates other active upcoming practices and upserts the three summer dates.
import { execSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

for (const k of ['SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_URL']) {
  if (!process.env[k]) process.env[k] = execSync(`netlify env:get ${k}`, { encoding: 'utf8' }).trim();
}
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const SUMMER_DATES = ['2026-06-18', '2026-07-16', '2026-08-13'];

const rows = SUMMER_DATES.map((practice_date) => ({
  practice_date,
  day_of_week: 'Thursday',
  day_order: 4,
  start_time: '18:00:00',
  end_time: '19:00:00',
  team_type: 'youth',
  location: 'Flyers Skate Zone',
  rink: 'Flyers Ice Rink',
  description: 'Summer Practice Session',
  season: 'Summer 2026',
  effective_from: practice_date,
  effective_to: practice_date,
  is_active: true,
  notes: `Thursday, ${new Date(practice_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at 6:00 PM`,
}));

// Deactivate any other active upcoming practices (regular season, etc.)
const { error: deactivateError } = await supabase
  .from('practice_schedules')
  .update({ is_active: false })
  .eq('is_active', true)
  .neq('season', 'Summer 2026')
  .gte('effective_to', new Date().toISOString().split('T')[0]);

if (deactivateError) {
  console.error('✗ Failed to deactivate old practices:', deactivateError.message);
} else {
  console.log('✓ Deactivated non-summer upcoming practices');
}

for (const row of rows) {
  const { data: existing } = await supabase
    .from('practice_schedules')
    .select('id')
    .eq('practice_date', row.practice_date)
    .eq('start_time', row.start_time)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('practice_schedules')
      .update({
        ...row,
        is_active: true,
      })
      .eq('id', existing.id);

    if (error) {
      console.error(`✗ ${row.practice_date} — update error:`, error.message);
    } else {
      console.log(`✓ ${row.practice_date} Summer Practice Session 6-7pm — updated (${existing.id})`);
    }
    continue;
  }

  const { data, error } = await supabase.from('practice_schedules').insert(row).select('id').single();
  if (error) {
    console.error(`✗ ${row.practice_date} — insert error:`, error.message);
  } else {
    console.log(`✓ ${row.practice_date} Summer Practice Session 6-7pm — inserted (${data.id})`);
  }
}
