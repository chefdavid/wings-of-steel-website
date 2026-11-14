import { createClient } from '@supabase/supabase-js';

// Sign-up for the 25th Anniversary Alumni Game. Saves the row with the
// service-role key (the table is closed to the public anon key), then emails
// the team and the person who signed up. A failed email never fails the
// sign-up: the row is already saved.

const TEAM_EMAILS = ['sjsledhockey@hotmail.com'];

const EVENT = {
  name: '25th Anniversary Alumni Game',
  when: 'Saturday, February 20, 2027 at 2:00 PM',
  where: 'Flyers Training Center, 601 Laurel Oak Rd, Voorhees, NJ 08043',
};

// Keep in step with SHIRT_SIZES in src/pages/AlumniGame.tsx.
const SHIRT_SIZES = ['Youth S', 'Youth M', 'Youth L', 'Youth XL', 'Adult S', 'Adult M', 'Adult L', 'Adult XL', 'Adult 2XL', 'Adult 3XL'];

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const respond = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) });

const clean = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return respond(405, { success: false, message: 'Method not allowed' });

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch {
    return respond(400, { success: false, message: 'Invalid request.' });
  }

  // Hidden field real visitors never fill in. Answer as if it worked.
  if (clean(data.website, 200)) return respond(200, { success: true });

  const registration = {
    full_name: clean(data.fullName, 120),
    phone: clean(data.phone, 40),
    email: clean(data.email, 200).toLowerCase(),
    shirt_size: clean(data.shirtSize, 20),
    years_played: clean(data.yearsPlayed, 120),
  };

  if (!registration.full_name) {
    return respond(400, { success: false, message: 'Please enter your name.' });
  }
  if (registration.phone.replace(/\D/g, '').length < 10) {
    return respond(400, { success: false, message: 'Please enter a phone number with area code.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registration.email)) {
    return respond(400, { success: false, message: 'Please enter a valid email address.' });
  }
  if (!SHIRT_SIZES.includes(registration.shirt_size)) {
    return respond(400, { success: false, message: 'Please choose a shirt size.' });
  }
  if (!registration.years_played) {
    return respond(400, { success: false, message: 'Please tell us the years you played.' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error('alumni-game-register: Supabase service-role credentials are missing');
    return respond(500, { success: false, message: 'Sign-up is not available right now.' });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await supabase.from('alumni_game_registrations').insert([registration]);
  if (error) {
    console.error('alumni-game-register: insert failed', error);
    return respond(500, { success: false, message: 'We could not save your sign-up. Please try again.' });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('alumni-game-register: RESEND_API_KEY not configured, sign-up saved without email');
    return respond(200, { success: true, emailed: false });
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Wings of Steel <noreply@wingsofsteel.org>';
  const row = (label, value) =>
    value
      ? `<tr><td style="padding:6px 12px 6px 0;color:#6b7280;vertical-align:top">${label}</td><td style="padding:6px 0;color:#111827">${escapeHtml(value)}</td></tr>`
      : '';

  const teamHtml = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#111827;line-height:1.5">
    <h2 style="margin:0 0 4px">New Alumni Game sign-up</h2>
    <p style="margin:0 0 16px;color:#6b7280">${EVENT.when}</p>
    <table style="border-collapse:collapse;font-size:15px">
      ${row('Name', registration.full_name)}
      ${row('Phone', registration.phone)}
      ${row('Email', registration.email)}
      ${row('Shirt size', registration.shirt_size)}
      ${row('Years played', registration.years_played)}
    </table>
    <p style="margin-top:16px;color:#6b7280;font-size:13px">Reply to this email to write back to ${escapeHtml(registration.full_name)}.</p>
  </body></html>`;

  const confirmHtml = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#111827;line-height:1.6">
    <h2 style="margin:0 0 12px">You're signed up for the Alumni Game</h2>
    <p>Hi ${escapeHtml(registration.full_name)},</p>
    <p>Thanks for signing up for the Wings of Steel ${EVENT.name}. We have you down for a size ${escapeHtml(registration.shirt_size)} shirt.</p>
    <p><strong>When:</strong> ${EVENT.when}<br><strong>Where:</strong> ${EVENT.where}</p>
    <p>We'll be in touch by email with anything else you need to know before the game. If your plans change, just reply to this email.</p>
    <p>Wings of Steel Sled Hockey</p>
  </body></html>`;

  try {
    const response = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([
        {
          from: fromEmail,
          to: TEAM_EMAILS,
          subject: `Alumni Game sign-up: ${registration.full_name}`,
          html: teamHtml,
          reply_to: registration.email,
        },
        {
          from: fromEmail,
          to: registration.email,
          subject: "You're signed up for the Wings of Steel Alumni Game",
          html: confirmHtml,
          reply_to: TEAM_EMAILS[0],
        },
      ]),
    });
    if (!response.ok) {
      console.error('alumni-game-register: Resend error', await response.text());
      return respond(200, { success: true, emailed: false });
    }
  } catch (emailError) {
    console.error('alumni-game-register: email failed', emailError);
    return respond(200, { success: true, emailed: false });
  }

  return respond(200, { success: true, emailed: true });
};
