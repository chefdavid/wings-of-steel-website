import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey
  ? new Stripe(stripeKey, { apiVersion: '2023-10-16' })
  : null;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const PRINTIFY_API_TOKEN =
  process.env.PRINTIFY_API_TOKEN || process.env.VITE_PRINTIFY_API_TOKEN;
const PRINTIFY_SHOP_ID =
  process.env.PRINTIFY_SHOP_ID || process.env.VITE_PRINTIFY_SHOP_ID;

const ORDER_NOTIFICATION_URL =
  process.env.URL // Netlify sets this to the deploy URL
    ? `${process.env.URL}/.netlify/functions/send-order-notification`
    : null;

async function fulfillPrintifyOrder(paymentIntent) {
  const { data: order, error: fetchError } = await supabase
    .from('store_orders')
    .select('*')
    .eq('payment_intent_id', paymentIntent.id)
    .maybeSingle();

  if (fetchError) {
    console.error('store_orders lookup failed:', fetchError);
    return;
  }
  if (!order) {
    console.error('No store_orders row for payment_intent', paymentIntent.id);
    return;
  }
  if (order.status === 'fulfilled') {
    console.log('Order already fulfilled, skipping:', paymentIntent.id);
    return;
  }

  if (!PRINTIFY_API_TOKEN || !PRINTIFY_SHOP_ID) {
    console.error('Printify credentials missing in webhook environment');
    await supabase
      .from('store_orders')
      .update({
        status: 'failed',
        error_message: 'Printify credentials not configured',
      })
      .eq('payment_intent_id', paymentIntent.id);
    return;
  }

  const printifyOrder = {
    external_id: paymentIntent.id,
    label: `WoS-${paymentIntent.id.slice(-8)}`,
    line_items: order.line_items.map((item) => ({
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
    })),
    shipping_method: 1,
    send_shipping_notification: true,
    address_to: order.shipping_address,
  };

  let printifyResult;
  try {
    const response = await fetch(
      `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/orders.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PRINTIFY_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(printifyOrder),
      },
    );
    const text = await response.text();
    printifyResult = text ? JSON.parse(text) : {};
    if (!response.ok) {
      console.error('Printify order failed:', response.status, printifyResult);
      await supabase
        .from('store_orders')
        .update({
          status: 'failed',
          error_message: `Printify ${response.status}: ${
            printifyResult?.message || text || 'unknown error'
          }`,
          printify_response: printifyResult,
        })
        .eq('payment_intent_id', paymentIntent.id);
      return;
    }
  } catch (err) {
    console.error('Printify fetch threw:', err);
    await supabase
      .from('store_orders')
      .update({
        status: 'failed',
        error_message: `Printify fetch error: ${err.message}`,
      })
      .eq('payment_intent_id', paymentIntent.id);
    return;
  }

  const printifyOrderId =
    printifyResult?.id || printifyResult?.data?.id || null;

  await supabase
    .from('store_orders')
    .update({
      status: 'fulfilled',
      printify_order_id: printifyOrderId,
      printify_response: printifyResult,
      error_message: null,
    })
    .eq('payment_intent_id', paymentIntent.id);

  if (ORDER_NOTIFICATION_URL) {
    try {
      await fetch(ORDER_NOTIFICATION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: order.shipping_address,
          items: order.line_items.map((item) => ({
            title: item.title,
            variant: item.variant_title,
            quantity: item.quantity,
            price: item.price,
          })),
          total: order.total_cents,
          paymentId: paymentIntent.id,
        }),
      });
    } catch (notifyErr) {
      console.error('Admin notification failed:', notifyErr);
    }
  }
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    let stripeEvent;

    if (webhookSecret) {
      const sig = event.headers['stripe-signature'];
      try {
        stripeEvent = stripe.webhooks.constructEvent(
          event.body,
          sig,
          webhookSecret,
        );
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Webhook signature verification failed' }),
        };
      }
    } else {
      stripeEvent = JSON.parse(event.body);
    }

    switch (stripeEvent.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = stripeEvent.data.object;
        const metadataType = paymentIntent.metadata?.type;
        console.log(
          'Payment succeeded:',
          paymentIntent.id,
          'type:',
          metadataType || '(none)',
        );

        if (paymentIntent.metadata?.event === 'pizza-pins-pop-2024') {
          try {
            const { error } = await supabase
              .from('event_registrations')
              .update({
                payment_status: 'completed',
                updated_at: new Date().toISOString(),
              })
              .eq('payment_intent_id', paymentIntent.id);
            if (error) console.error('event_registrations update error:', error);
          } catch (dbError) {
            console.error('Database error:', dbError);
          }
        } else if (metadataType === 'printify') {
          await fulfillPrintifyOrder(paymentIntent);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const failedPayment = stripeEvent.data.object;
        const metadataType = failedPayment.metadata?.type;
        console.log('Payment failed:', failedPayment.id);

        if (failedPayment.metadata?.event === 'pizza-pins-pop-2024') {
          try {
            const { error } = await supabase
              .from('event_registrations')
              .update({
                payment_status: 'failed',
                updated_at: new Date().toISOString(),
              })
              .eq('payment_intent_id', failedPayment.id);
            if (error) console.error('event_registrations update error:', error);
          } catch (dbError) {
            console.error('Database error:', dbError);
          }
        } else if (metadataType === 'printify') {
          await supabase
            .from('store_orders')
            .update({
              status: 'failed',
              error_message: 'payment_intent.payment_failed',
            })
            .eq('payment_intent_id', failedPayment.id);
        }
        break;
      }

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
