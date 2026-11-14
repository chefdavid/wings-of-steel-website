import { createClient } from '@supabase/supabase-js';

// Sign-up for the 25th Anniversary Alumni Game. Saves the row with the
// service-role key (the table is closed to the public anon key), then emails
// the team and the person who signed up. A failed email never fails the
// sign-up: the row is already saved.

const TEAM_EMAILS = ['sjsledhockey@hotmail.com', 'kristigonzales1977@yahoo.com'];

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
  const firstName = registration.full_name.split(/\s+/)[0];
  const FONT = "font-family:Arial,Helvetica,sans-serif";

  // Email clients ignore most CSS, so both emails are plain tables with inline
  // styles: a 600px card, a navy header with a red rule, then the details.
  const shell = (eyebrow, title, body) => `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#eef1f5;${FONT}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f5">
  <tr><td align="center" style="padding:24px 12px">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden">
      <tr><td style="background:#0b1f3a;padding:28px 32px;border-bottom:5px solid #c8102e">
        <div style="${FONT};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#f2b84b;font-weight:bold">${eyebrow}</div>
        <div style="${FONT};font-size:26px;line-height:1.2;color:#ffffff;font-weight:bold;margin-top:6px">${title}</div>
      </td></tr>
      <tr><td style="padding:28px 32px;${FONT};font-size:16px;line-height:1.6;color:#1f2937">${body}</td></tr>
      <tr><td style="background:#f3f4f6;padding:18px 32px;${FONT};font-size:13px;line-height:1.5;color:#4b5563;text-align:center">
        <strong style="color:#0b1f3a">Wings of Steel Sled Hockey</strong><br>
        Celebrating 25 years &middot; <a href="https://wingsofsteel.org" style="color:#0b1f3a">wingsofsteel.org</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  const detailRow = (label, value, last) =>
    `<tr>
      <td style="padding:10px 16px;${FONT};font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;width:38%;vertical-align:top${last ? '' : ';border-bottom:1px solid #e5e7eb'}">${label}</td>
      <td style="padding:10px 16px;${FONT};font-size:16px;color:#111827;font-weight:bold;vertical-align:top${last ? '' : ';border-bottom:1px solid #e5e7eb'}">${value}</td>
    </tr>`;

  const detailTable = (rows) =>
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;margin:18px 0">${rows
      .map(([label, value], i) => detailRow(label, value, i === rows.length - 1))
      .join('')}</table>`;

  const safe = {
    name: escapeHtml(registration.full_name),
    first: escapeHtml(firstName),
    phone: escapeHtml(registration.phone),
    email: escapeHtml(registration.email),
    shirt: escapeHtml(registration.shirt_size),
    years: escapeHtml(registration.years_played),
  };

  const teamHtml = shell(
    'New sign-up',
    '25th Anniversary Alumni Game',
    `<p style="margin:0"><strong>${safe.name}</strong> just signed up to play.</p>
     ${detailTable([
       ['Name', safe.name],
       ['Phone', `<a href="tel:${safe.phone}" style="color:#0b1f3a">${safe.phone}</a>`],
       ['Email', `<a href="mailto:${safe.email}" style="color:#0b1f3a">${safe.email}</a>`],
       ['Shirt size', safe.shirt],
       ['Years played', safe.years],
     ])}
     <p style="margin:0;font-size:14px;color:#4b5563">Reply to this email to write back to ${safe.first}. The full list is in the website admin under Events, Alumni Game Sign-Ups.</p>`
  );

  const confirmHtml = shell(
    "You're signed up",
    '25th Anniversary Alumni Game',
    `<p style="margin:0 0 12px">Hi ${safe.first},</p>
     <p style="margin:0">Thanks for signing up for the Wings of Steel 25th Anniversary Alumni Game. We can't wait to see you back on the ice.</p>
     ${detailTable([
       ['When', 'Saturday, February 20, 2027<br>2:00 PM'],
       ['Where', 'Flyers Training Center<br><span style="font-weight:normal">601 Laurel Oak Rd, Voorhees, NJ 08043</span>'],
       ['Your shirt size', safe.shirt],
     ])}
     <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px"><tr><td style="background:#c8102e;border-radius:6px">
       <a href="https://www.google.com/maps/dir/?api=1&amp;destination=Flyers%20Training%20Center%2C%20601%20Laurel%20Oak%20Rd%2C%20Voorhees%2C%20NJ%2008043" style="display:inline-block;padding:12px 22px;${FONT};font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none">Get directions</a>
     </td></tr></table>
     <p style="margin:0 0 12px">This game honors Tom Brake and all of our players who are no longer with us.</p>
     <p style="margin:0;font-size:14px;color:#4b5563">We'll email you anything else you need to know before the game. If your plans change, just reply to this email.</p>`
  );

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
