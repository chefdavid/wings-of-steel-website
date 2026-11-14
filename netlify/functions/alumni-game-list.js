import { createClient } from '@supabase/supabase-js';

// Alumni Game sign-ups for the admin screen: GET lists them, POST edits or
// deletes one ({ action: 'update', id, ...fields } or { action: 'delete', id }).
//
// WARNING: this endpoint has no login in front of it, because the admin itself
// has none yet (AdminAuth.tsx lets any sign-in through). Anyone who knows this
// URL can read, change or delete the sign-ups. The owner accepted that on
// 2026-11-14 until the admin login is fixed. When it is, check the caller here.

// Keep in step with SHIRT_SIZES in alumni-game-register.js and AlumniGame.tsx.
const SHIRT_SIZES = ['Youth S', 'Youth M', 'Youth L', 'Youth XL', 'Adult S', 'Adult M', 'Adult L', 'Adult XL', 'Adult 2XL', 'Adult 3XL'];
const COLUMNS = 'id, full_name, phone, email, shirt_size, years_played, created_at';
const clean = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const isUuid = (value) => typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
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

  const reply = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) });

  if (event.httpMethod === 'POST') {
    let payload;
    try {
      payload = JSON.parse(event.body || '{}');
    } catch {
      return reply(400, { error: 'Invalid request.' });
    }
    if (!isUuid(payload.id)) return reply(400, { error: 'Missing sign-up id.' });

    if (payload.action === 'delete') {
      const { error: deleteError } = await supabase.from('alumni_game_registrations').delete().eq('id', payload.id);
      if (deleteError) {
        console.error('alumni-game-list: delete failed', deleteError);
        return reply(500, { error: 'Could not delete the sign-up.' });
      }
      return reply(200, { deleted: payload.id });
    }

    if (payload.action === 'update') {
      const changes = {
        full_name: clean(payload.full_name, 120),
        phone: clean(payload.phone, 40),
        email: clean(payload.email, 200).toLowerCase(),
        shirt_size: clean(payload.shirt_size, 20),
        years_played: clean(payload.years_played, 120),
      };
      if (!changes.full_name) return reply(400, { error: 'Name cannot be blank.' });
      if (!changes.phone) return reply(400, { error: 'Phone cannot be blank.' });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(changes.email)) return reply(400, { error: 'Enter a valid email address.' });
      if (!SHIRT_SIZES.includes(changes.shirt_size)) return reply(400, { error: 'Choose a shirt size.' });
      if (!changes.years_played) return reply(400, { error: 'Years played cannot be blank.' });

      const { data: updated, error: updateError } = await supabase
        .from('alumni_game_registrations')
        .update(changes)
        .eq('id', payload.id)
        .select(COLUMNS)
        .maybeSingle();
      if (updateError) {
        console.error('alumni-game-list: update failed', updateError);
        return reply(500, { error: 'Could not save the change.' });
      }
      if (!updated) return reply(404, { error: 'That sign-up no longer exists.' });
      return reply(200, { registration: updated });
    }

    return reply(400, { error: 'Unknown action.' });
  }

  const { data, error } = await supabase
    .from('alumni_game_registrations')
    .select(COLUMNS)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('alumni-game-list: query failed', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Could not load the sign-ups.' }) };
  }

  return { statusCode: 200, headers, body: JSON.stringify({ registrations: data || [] }) };
};
