// Add the 4 single-date summer/off-season practices from the 2026-05-04 screenshot.
// All are Thursdays, 6:00 PM - 7:00 PM. Idempotent: skips a row if a practice
// already exists at the same practice_date + start_time + rink.
import { execSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

for (const k of ['SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_URL']) {
  if (!process.env[k]) process.env[k] = execSync(`netlify env:get ${k}`, { encoding: 'utf8' }).trim();
}
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const rows = [
  { practice_date: '2026-05-07', rink: 'Phantoms Ice',     location: 'Phantoms Ice' },
  { practice_date: '2026-06-18', rink: 'Phantoms Ice',     location: 'Phantoms Ice' },
  { practice_date: '2026-07-16', rink: 'Flyers Ice Rink',  location: 'Flyers Skate Zone' },
  { practice_date: '2026-08-13', rink: 'Flyers Ice Rink',  location: 'Flyers Skate Zone' },
].map(r => ({
  ...r,
  day_of_week: 'Thursday',
  day_order: 5,
  start_time: '18:00:00',
  end_time: '19:00:00',
  team_type: 'youth',
  season: 'Summer 2026',
  effective_from: r.practice_date,
  effective_to: r.practice_date,
  is_active: true,
}));

for (const row of rows) {
  // Skip if a row already exists for this date + time + rink.
  const { data: existing } = await supabase
    .from('practice_schedules')
    .select('id')
    .eq('practice_date', row.practice_date)
    .eq('start_time', row.start_time)
    .eq('rink', row.rink)
    .maybeSingle();

  if (existing) {
    console.log(`• ${row.practice_date} ${row.rink} — already exists (${existing.id}), skipping`);
    continue;
  }

  const { data, error } = await supabase.from('practice_schedules').insert(row).select('id').single();
  if (error) {
    console.error(`✗ ${row.practice_date} ${row.rink} — error:`, error.message);
  } else {
    console.log(`✓ ${row.practice_date} ${row.rink} 6-7pm — inserted (${data.id})`);
  }
}
