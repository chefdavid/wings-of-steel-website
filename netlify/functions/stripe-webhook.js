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

// Stripe webhook secret (set this in Stripe Dashboard -> Webhooks)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    let stripeEvent;

    if (webhookSecret) {
      // Verify webhook signature
      const sig = event.headers['stripe-signature'];
      try {
        stripeEvent = stripe.webhooks.constructEvent(
          event.body,
          sig,
          webhookSecret
        );
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Webhook signature verification failed' }),
        };
      }
    } else {
      // In development, just parse the body
      stripeEvent = JSON.parse(event.body);
    }

    // Handle the event
    switch (stripeEvent.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = stripeEvent.data.object;
        console.log('Payment succeeded:', paymentIntent.id);

        // Check if this is a Pizza Pins & Pop event
        if (paymentIntent.metadata && paymentIntent.metadata.event === 'pizza-pins-pop-2024') {
          // Update the registration status in Supabase
          try {
            const { data, error } = await supabase
              .from('event_registrations')
              .update({
                payment_status: 'completed',
                updated_at: new Date().toISOString()
              })
              .eq('payment_intent_id', paymentIntent.id);

            if (error) {
              console.error('Error updating registration status:', error);
            } else {
              console.log('Registration status updated to completed');
            }

            // Send confirmation email (optional - you can integrate with SendGrid or another email service)
            // await sendConfirmationEmail(paymentIntent.metadata);

          } catch (dbError) {
            console.error('Database error:', dbError);
          }
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = stripeEvent.data.object;
        console.log('Payment failed:', failedPayment.id);

        if (failedPayment.metadata && failedPayment.metadata.event === 'pizza-pins-pop-2024') {
          try {
            const { error } = await supabase
              .from('event_registrations')
              .update({
                payment_status: 'failed',
                updated_at: new Date().toISOString()
              })
              .eq('payment_intent_id', failedPayment.id);

            if (error) {
              console.error('Error updating registration status:', error);
            }
          } catch (dbError) {
            console.error('Database error:', dbError);
          }
        }
        break;

      default:
        console.log(`Unhandled event type ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook handler error' }),
    };
  }
};