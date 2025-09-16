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
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const {
      amount,
      customerInfo,
      packageName,
      addons,
      donation
    } = JSON.parse(event.body);

    // Validate required fields
    if (!amount || amount <= 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid amount' }),
      };
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Customer information is required' }),
      };
    }

    // Check if Stripe is initialized
    if (!stripe) {
      console.error('Stripe is not initialized. Check your STRIPE_SECRET_KEY environment variable.');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Payment processing is not configured',
          details: 'Stripe secret key is missing or invalid'
        }),
      };
    }

    console.log(`Creating Pizza Pins & Pop payment for: ${customerInfo.name}, amount: $${amount/100}`);

    // Create Stripe payment intent with metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      description: 'Pizza, Pins & Pop Fundraiser - Wings of Steel',
      metadata: {
        event: 'pizza-pins-pop-2024',
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone || '',
        company: customerInfo.company || '',
        package: packageName,
        addons: JSON.stringify(addons || []),
        donation: donation || 0,
        team_members: customerInfo.teamMembers || '',
        special_requests: customerInfo.specialRequests || ''
      },
      receipt_email: customerInfo.email,
    });

    console.log('Payment intent created:', paymentIntent.id);

    // Store registration in Supabase
    try {
      // Calculate package price
      const packagePrice = packageName === 'Lane Reservation' ? 15000 : 15000;
      const subtotal = packagePrice + (addons || []).reduce((sum, addon) => sum + (addon.price || 0), 0);

      // Store the registration with complete data
      const { data: registration, error: insertError } = await supabase
        .from('event_registrations')
        .insert({
          event_name: 'Pizza, Pins & Pop 2024',
          event_date: '2024-10-26',
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone || null,
          customer_company: customerInfo.company || null,
          team_members: customerInfo.teamMembers || null,
          special_requests: customerInfo.specialRequests || null,
          package_name: packageName,
          package_price: packagePrice,
          addons: addons || [],
          donation_amount: donation || 0,
          subtotal: subtotal,
          total_amount: amount,
          payment_intent_id: paymentIntent.id,
          payment_status: 'pending',
          payment_method: 'stripe'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error storing registration:', insertError);

        // If table doesn't exist, log the SQL to create it
        if (insertError.message && insertError.message.includes('does not exist')) {
          console.log('Table does not exist. Please create it with the following SQL in Supabase dashboard:');
          console.log(`
CREATE TABLE event_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_date DATE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_company TEXT,
  team_members TEXT,
  special_requests TEXT,
  package_name TEXT,
  package_price INTEGER,
  addons JSONB DEFAULT '[]'::jsonb,
  donation_amount INTEGER DEFAULT 0,
  subtotal INTEGER,
  total_amount INTEGER NOT NULL,
  payment_intent_id TEXT UNIQUE,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_event_name ON event_registrations(event_name);
CREATE INDEX idx_payment_intent ON event_registrations(payment_intent_id);
CREATE INDEX idx_customer_email ON event_registrations(customer_email);
CREATE INDEX idx_created_at ON event_registrations(created_at);
          `);
        }
        // Don't fail the payment if storage fails
      } else {
        console.log('Registration stored successfully:', registration.id);
      }
    } catch (dbError) {
      console.error('Database error (non-critical):', dbError);
      // Continue with payment even if database fails
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
    };
  } catch (error) {
    console.error('Error processing Pizza Pins & Pop payment:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to process payment',
        details: error.message
      }),
    };
  }
};