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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    if (!stripe) {
      throw new Error('Stripe not configured');
    }

    const { paymentIntentId } = JSON.parse(event.body);

    if (!paymentIntentId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'paymentIntentId is required' }),
      };
    }

    // Verify the actual status with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    console.log(`Confirming payment ${paymentIntentId}: Stripe status = ${paymentIntent.status}`);

    let newStatus;
    if (paymentIntent.status === 'succeeded') {
      newStatus = 'succeeded';
    } else if (paymentIntent.status === 'canceled') {
      newStatus = 'failed';
    } else {
      // Still processing or requires action — don't update
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          updated: false,
          stripeStatus: paymentIntent.status,
          message: 'Payment not yet completed',
        }),
      };
    }

    // Update the database
    const { error: updateError } = await supabase
      .from('donations')
      .update({
        payment_status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntentId);

    if (updateError) {
      console.error('Error updating payment status:', updateError);
      throw updateError;
    }

    console.log(`Payment ${paymentIntentId} status updated to ${newStatus}`);

    // Mirror onto golf_registrations when this is a golf-outing payment.
    // Status mapping:
    //   succeeded -> completed
    //   failed    -> attempted
    // We match by metadata.golf_registration_id with a fallback to
    // stripe_payment_intent_id. We never overwrite a completed row.
    const regId = paymentIntent.metadata?.golf_registration_id;
    const isGolf = paymentIntent.metadata?.event_tag === 'golf-outing' || !!regId;

    if (isGolf) {
      const golfStatus = newStatus === 'succeeded' ? 'completed' : 'attempted';
      const updates = golfStatus === 'completed'
        ? { payment_status: 'completed', payment_method: 'stripe', payment_date: new Date().toISOString() }
        : { payment_status: 'attempted' };

      let golfQuery = supabase
        .from('golf_registrations')
        .update(updates)
        .neq('payment_status', 'completed');

      golfQuery = regId
        ? golfQuery.eq('id', regId)
        : golfQuery.eq('stripe_payment_intent_id', paymentIntentId);

      const { error: golfError } = await golfQuery;
      if (golfError) {
        console.error('Error syncing golf_registration status:', golfError);
        // Non-fatal: webhook will retry.
      } else {
        console.log(`golf_registration status set to ${golfStatus}`);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        updated: true,
        status: newStatus,
      }),
    };

  } catch (error) {
    console.error('Confirm payment status error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to confirm payment status',
        details: error.message,
      }),
    };
  }
};
