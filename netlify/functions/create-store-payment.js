// Creates a Stripe PaymentIntent for a Printify-fulfilled store purchase and
// records a pending row in store_orders so the webhook can complete fulfillment
// even if the customer closes their tab between charge and Printify call.

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey
  ? new Stripe(stripeKey, { apiVersion: '2023-10-16' })
  : null;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (statusCode, body) => ({
  statusCode,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const isInt = (n) => Number.isInteger(n) && n >= 0;

const truncate = (s, max) =>
  s && s.length > max ? `${s.slice(0, max - 1)}…` : s ?? '';

const summarizeItems = (items) => {
  // Stripe metadata values cap at 500 chars. Build a compact, human-readable summary.
  const parts = items.map((item) => {
    const title = item.title || `product ${item.product_id}`;
    const variant = item.variant_title ? ` (${item.variant_title})` : '';
    return `${item.quantity}× ${title}${variant}`;
  });
  return truncate(parts.join(', '), 480);
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }
  if (!stripe) {
    return json(500, { error: 'Stripe is not configured' });
  }
  if (!supabase) {
    return json(500, { error: 'Supabase is not configured' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  const {
    address,
    line_items,
    subtotal_cents,
    shipping_cents = 0,
    tax_cents = 0,
    donation_amount_cents = 0,
    fee_cover_cents = 0,
  } = payload || {};

  if (!address || typeof address !== 'object') {
    return json(400, { error: 'address is required' });
  }
  const requiredAddressFields = [
    'first_name',
    'last_name',
    'email',
    'address1',
    'city',
    'region',
    'zip',
    'country',
  ];
  for (const field of requiredAddressFields) {
    if (!address[field]) {
      return json(400, { error: `address.${field} is required` });
    }
  }

  if (!Array.isArray(line_items) || line_items.length === 0) {
    return json(400, { error: 'line_items must be a non-empty array' });
  }
  for (const item of line_items) {
    if (
      !item ||
      typeof item.product_id !== 'string' ||
      !Number.isInteger(item.variant_id) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      !isInt(item.price)
    ) {
      return json(400, { error: 'Invalid line item shape' });
    }
  }

  for (const [name, value] of Object.entries({
    subtotal_cents,
    shipping_cents,
    tax_cents,
    donation_amount_cents,
    fee_cover_cents,
  })) {
    if (!isInt(value)) {
      return json(400, { error: `${name} must be a non-negative integer` });
    }
  }

  const expectedSubtotal = line_items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  if (expectedSubtotal !== subtotal_cents) {
    return json(400, {
      error: 'subtotal_cents does not match line_items totals',
      expected: expectedSubtotal,
      received: subtotal_cents,
    });
  }

  const total_cents =
    subtotal_cents +
    shipping_cents +
    tax_cents +
    donation_amount_cents +
    fee_cover_cents;
  if (total_cents <= 0) {
    return json(400, { error: 'total must be greater than zero' });
  }

  const metadata = {
    type: 'printify',
    event_tag: 'store',
    item_count: String(line_items.reduce((n, i) => n + i.quantity, 0)),
    item_summary: summarizeItems(line_items),
    subtotal_cents: String(subtotal_cents),
    shipping_cents: String(shipping_cents),
    tax_cents: String(tax_cents),
    donation_amount_cents: String(donation_amount_cents),
    fee_cover_cents: String(fee_cover_cents),
  };

  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount: total_cents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      receipt_email: address.email,
      description:
        donation_amount_cents > 0
          ? 'Wings of Steel store purchase + donation'
          : 'Wings of Steel store purchase',
      metadata,
    });
  } catch (err) {
    console.error('PaymentIntent create failed:', err);
    return json(500, {
      error: 'Failed to create payment intent',
      details: err.message,
    });
  }

  const { error: insertError } = await supabase.from('store_orders').insert({
    payment_intent_id: paymentIntent.id,
    status: 'pending',
    customer_email: address.email,
    shipping_address: address,
    line_items,
    subtotal_cents,
    shipping_cents,
    tax_cents,
    donation_amount_cents,
    fee_cover_cents,
    total_cents,
  });

  if (insertError) {
    console.error('store_orders insert failed:', insertError);
    // The PaymentIntent already exists; cancel it so we don't charge a customer
    // for an order we can't fulfill.
    try {
      await stripe.paymentIntents.cancel(paymentIntent.id);
    } catch (cancelErr) {
      console.error('Failed to cancel orphan PaymentIntent:', cancelErr);
    }
    return json(500, {
      error: 'Failed to record order',
      details: insertError.message,
    });
  }

  return json(200, {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });
};
