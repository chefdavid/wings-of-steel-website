import { createClient } from '@supabase/supabase-js';

// Returns the Alumni Game sign-ups for the admin screen.
//
// WARNING: this endpoint has no login in front of it, because the admin itself
// has none yet (AdminAuth.tsx lets any sign-in through). Anyone who knows this
// URL can read the names, phones and emails. The owner accepted that on
// 2026-11-14 until the admin login is fixed. When it is, check the caller here.

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error('alumni-game-list: Supabase service-role credentials are missing');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Sign-ups are not available right now.' }) };
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase
    .from('alumni_game_registrations')
    .select('id, full_name, phone, email, shirt_size, years_played, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('alumni-game-list: query failed', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Could not load the sign-ups.' }) };
  }

  return { statusCode: 200, headers, body: JSON.stringify({ registrations: data || [] }) };
};
