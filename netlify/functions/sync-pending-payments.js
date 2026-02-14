import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: '2023-10-16',
}) : null;

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const handler = async (event, context) => {
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
      throw new Error('Stripe not configured');
    }

    // Get ALL pending donations (not just topgolf)
    const { data: pendingDonations, error: fetchError } = await supabase
      .from('donations')
      .select('*')
      .eq('payment_status', 'pending');

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${pendingDonations?.length || 0} pending payments to sync`);

    const results = {
      total: pendingDonations?.length || 0,
      updated: 0,
      stillPending: 0,
      failed: 0,
      errors: [],
      details: []
    };

    for (const donation of pendingDonations || []) {
      try {
        if (!donation.stripe_payment_intent_id) {
          results.errors.push(`Donation ${donation.id} has no payment intent ID`);
          continue;
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(
          donation.stripe_payment_intent_id
        );

        console.log(`Donation ${donation.id} (${donation.event_tag || 'general'}): Stripe status = ${paymentIntent.status}`);

        if (paymentIntent.status === 'succeeded') {
          const { error: updateError } = await supabase
            .from('donations')
            .update({
              payment_status: 'succeeded',
              updated_at: new Date().toISOString()
            })
            .eq('id', donation.id);

          if (updateError) {
            results.errors.push(`Failed to update donation ${donation.id}: ${updateError.message}`);
          } else {
            results.updated++;
            results.details.push({
              id: donation.id,
              name: donation.donor_name,
              email: donation.donor_email,
              amount: donation.amount,
              event_tag: donation.event_tag || 'general',
              status: 'updated to succeeded'
            });
          }
        } else if (paymentIntent.status === 'requires_payment_method' ||
                   paymentIntent.status === 'requires_confirmation' ||
                   paymentIntent.status === 'requires_action') {
          results.stillPending++;
          results.details.push({
            id: donation.id,
            name: donation.donor_name,
            event_tag: donation.event_tag || 'general',
            stripe_status: paymentIntent.status,
            status: 'still pending - payment not completed'
          });
        } else if (paymentIntent.status === 'canceled') {
          await supabase
            .from('donations')
            .update({
              payment_status: 'failed',
              updated_at: new Date().toISOString()
            })
            .eq('id', donation.id);

          results.failed++;
          results.details.push({
            id: donation.id,
            name: donation.donor_name,
            event_tag: donation.event_tag || 'general',
            stripe_status: paymentIntent.status,
            status: 'marked as failed'
          });
        }
      } catch (stripeError) {
        results.errors.push(`Error checking donation ${donation.id}: ${stripeError.message}`);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(results, null, 2),
    };

  } catch (error) {
    console.error('Sync error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Sync failed',
        details: error.message
      }),
    };
  }
};
