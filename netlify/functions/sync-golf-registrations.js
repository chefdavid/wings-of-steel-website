import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: '2023-10-16' }) : null;

// Production sets SUPABASE_SERVICE_ROLE_KEY (no prefix). Local .env in
// this project uses the VITE_-prefixed name. Accept either.
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Window (minutes) for matching golf_registrations rows to a donations row
// when no stripe_payment_intent_id is stored yet.
const TIME_WINDOW_MINUTES = 15;

// Reconcile every non-completed golf_registrations row against Stripe.
// Status mapping:
//   Stripe 'succeeded'                                          -> 'completed'
//   Stripe 'requires_payment_method' / 'canceled' / not found   -> 'attempted'
//   Stripe 'processing' / 'requires_action' / 'requires_confirmation'
//                                                               -> leave as 'pending'
// We never delete or overwrite already-completed rows.
export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (!stripe) {
      throw new Error(
        'Stripe not configured: STRIPE_SECRET_KEY is missing. ' +
        'Run `netlify link` to pull production env, or add STRIPE_SECRET_KEY to .env.'
      );
    }
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase service-role credentials are missing.');
    }

    const { data: rows, error: fetchError } = await supabase
      .from('golf_registrations')
      .select('id, captain_info, total_amount, registration_date, payment_status, stripe_payment_intent_id')
      .neq('payment_status', 'completed');

    if (fetchError) throw fetchError;

    const results = {
      total: rows?.length || 0,
      markedCompleted: 0,
      markedAttempted: 0,
      leftPending: 0,
      linkedPaymentIntent: 0,
      errors: [],
      details: [],
    };

    for (const row of rows || []) {
      try {
        const captain = row.captain_info || {};
        const captainEmail = (captain.email || '').toLowerCase();

        // Find the Stripe payment intent ID. Three strategies, in order:
        //   1. Already stored on the row.
        //   2. Find a donations row for the same email/amount within window.
        //   3. None found -> mark as attempted (no Stripe activity).
        let paymentIntentId = row.stripe_payment_intent_id;
        let matchedVia = paymentIntentId ? 'stored' : null;

        if (!paymentIntentId && captainEmail) {
          // golf_registrations.registration_date is TIMESTAMP (no tz). The form
          // writes a UTC ISO string, but Postgres strips the trailing 'Z'.
          // Force UTC parsing so the time window points where the donation is.
          const rawDate = row.registration_date;
          const utcDate = /[zZ]|[+-]\d\d:?\d\d$/.test(rawDate) ? rawDate : rawDate + 'Z';
          const regTime = new Date(utcDate);
          const lo = new Date(regTime.getTime() - TIME_WINDOW_MINUTES * 60_000).toISOString();
          const hi = new Date(regTime.getTime() + TIME_WINDOW_MINUTES * 60_000).toISOString();

          const { data: donationMatches } = await supabase
            .from('donations')
            .select('stripe_payment_intent_id, payment_status, created_at')
            .eq('event_tag', 'golf-outing')
            .ilike('donor_email', captainEmail)
            .eq('amount', row.total_amount)
            .gte('created_at', lo)
            .lte('created_at', hi)
            .order('created_at', { ascending: true });

          if (donationMatches && donationMatches.length > 0) {
            paymentIntentId = donationMatches[0].stripe_payment_intent_id;
            matchedVia = 'donations-lookup';

            // Persist the link so future syncs / webhooks can find it directly.
            if (paymentIntentId) {
              const { error: linkError } = await supabase
                .from('golf_registrations')
                .update({ stripe_payment_intent_id: paymentIntentId })
                .eq('id', row.id);
              if (!linkError) results.linkedPaymentIntent++;
            }
          }
        }

        // No Stripe activity at all -> mark attempted.
        if (!paymentIntentId) {
          await markStatus(row.id, 'attempted');
          results.markedAttempted++;
          results.details.push({
            id: row.id,
            captain: `${captain.firstName || ''} ${captain.lastName || ''}`.trim(),
            email: captainEmail,
            amount: row.total_amount,
            outcome: 'attempted (no Stripe payment intent found)',
          });
          continue;
        }

        // Look up the actual Stripe status.
        let pi;
        try {
          pi = await stripe.paymentIntents.retrieve(paymentIntentId);
        } catch (stripeErr) {
          results.errors.push(`Row ${row.id}: Stripe lookup failed for ${paymentIntentId}: ${stripeErr.message}`);
          continue;
        }

        if (pi.status === 'succeeded') {
          await markStatus(row.id, 'completed');
          results.markedCompleted++;
          results.details.push({
            id: row.id,
            captain: `${captain.firstName || ''} ${captain.lastName || ''}`.trim(),
            email: captainEmail,
            amount: row.total_amount,
            paymentIntentId,
            matchedVia,
            outcome: 'completed',
          });
        } else if (
          pi.status === 'requires_payment_method' ||
          pi.status === 'canceled' ||
          pi.status === 'requires_confirmation'
        ) {
          await markStatus(row.id, 'attempted');
          results.markedAttempted++;
          results.details.push({
            id: row.id,
            captain: `${captain.firstName || ''} ${captain.lastName || ''}`.trim(),
            email: captainEmail,
            amount: row.total_amount,
            paymentIntentId,
            stripeStatus: pi.status,
            matchedVia,
            outcome: 'attempted',
          });
        } else {
          // 'processing' / 'requires_action' / etc. — payment may still complete.
          results.leftPending++;
          results.details.push({
            id: row.id,
            captain: `${captain.firstName || ''} ${captain.lastName || ''}`.trim(),
            email: captainEmail,
            amount: row.total_amount,
            paymentIntentId,
            stripeStatus: pi.status,
            outcome: 'left as pending (still in flight)',
          });
        }
      } catch (rowErr) {
        results.errors.push(`Row ${row.id}: ${rowErr.message}`);
      }
    }

    return { statusCode: 200, headers, body: JSON.stringify(results, null, 2) };
  } catch (error) {
    console.error('sync-golf-registrations error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Sync failed', details: error.message }),
    };
  }
};

async function markStatus(id, status) {
  const updates = status === 'completed'
    ? { payment_status: 'completed', payment_method: 'stripe', payment_date: new Date().toISOString() }
    : { payment_status: status };

  // Guard: never downgrade a row that is already 'completed'.
  const { error } = await supabase
    .from('golf_registrations')
    .update(updates)
    .eq('id', id)
    .neq('payment_status', 'completed');

  if (error) throw error;
}
