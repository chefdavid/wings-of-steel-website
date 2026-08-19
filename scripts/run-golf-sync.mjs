// One-off driver to invoke sync-golf-registrations without netlify dev.
// Reason: netlify-cli 23.6.0 + Node 24 + Windows is unstable (ECONNRESET).
// Pulls secrets from `netlify env:get` so they never land in the conversation
// or on disk. Run with: node scripts/run-golf-sync.mjs
import { execSync } from 'node:child_process';

const need = ['STRIPE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_URL'];
for (const key of need) {
  if (process.env[key]) continue;
  try {
    const value = execSync(`netlify env:get ${key}`, { encoding: 'utf8' }).trim();
    if (!value) throw new Error('empty');
    process.env[key] = value;
  } catch (e) {
    console.error(`Could not fetch env var ${key} from Netlify:`, e.message);
    process.exit(1);
  }
}

const { handler } = await import('../netlify/functions/sync-golf-registrations.js');
const result = await handler({ httpMethod: 'GET' });

console.log('---');
console.log('HTTP', result.statusCode);
try {
  console.log(JSON.stringify(JSON.parse(result.body), null, 2));
} catch {
  console.log(result.body);
}
