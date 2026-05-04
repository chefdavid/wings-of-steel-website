// Diagnose why sync-golf-registrations isn't matching donations rows.
import { execSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

const need = ['SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_URL'];
for (const key of need) {
  if (process.env[key]) continue;
  process.env[key] = execSync(`netlify env:get ${key}`, { encoding: 'utf8' }).trim();
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Pick one known-paid registration (Robert Fidanza $560 first row).
const { data: regs } = await supabase
  .from('golf_registrations')
  .select('id, captain_info, total_amount, registration_date, payment_status')
  .neq('payment_status', 'completed')
  .limit(5);

console.log('=== Sample golf_registrations (non-completed) ===');
for (const r of regs || []) {
  console.log({
    captain: `${r.captain_info?.firstName} ${r.captain_info?.lastName}`,
    email: r.captain_info?.email,
    amount: r.total_amount,
    when: r.registration_date,
    status: r.payment_status,
  });
}

// Now look in donations for golf-outing entries.
console.log('\n=== Sample donations where event_tag = golf-outing ===');
const { data: dons, error: donErr } = await supabase
  .from('donations')
  .select('id, donor_name, donor_email, amount, event_tag, payment_status, stripe_payment_intent_id, created_at')
  .eq('event_tag', 'golf-outing')
  .limit(10);

if (donErr) console.error('error:', donErr);
console.log(`count: ${dons?.length || 0}`);
for (const d of dons || []) {
  console.log({
    name: d.donor_name,
    email: d.donor_email,
    amount: d.amount,
    status: d.payment_status,
    pi: d.stripe_payment_intent_id?.slice(0, 14) + '...',
    when: d.created_at,
  });
}

// Try a specific match: Robert Fidanza, $560
console.log('\n=== Lookup: Robert Fidanza @ $560 (any event_tag) ===');
const { data: rfMatches } = await supabase
  .from('donations')
  .select('donor_name, donor_email, amount, event_tag, payment_status, stripe_payment_intent_id, created_at')
  .ilike('donor_email', 'bobfidanza@yahoo.com')
  .eq('amount', 560);
console.log(`matches: ${rfMatches?.length || 0}`);
for (const m of rfMatches || []) console.log(m);

// Total donations in table
const { count: totalDonations } = await supabase
  .from('donations')
  .select('*', { count: 'exact', head: true });
console.log(`\n=== Total donations rows: ${totalDonations} ===`);

const { count: golfDonations } = await supabase
  .from('donations')
  .select('*', { count: 'exact', head: true })
  .eq('event_tag', 'golf-outing');
console.log(`=== Donations with event_tag='golf-outing': ${golfDonations} ===`);
