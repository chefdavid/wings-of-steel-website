import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  console.error('STRIPE_SECRET_KEY is not configured');
}

// Check if using test or live key
const isTestMode = stripeKey && stripeKey.startsWith('sk_test_');
const isLiveKey = stripeKey && stripeKey.startsWith('sk_live_');

// Allow live keys in development for testing (with warning)
if (isLiveKey) {
  console.warn('WARNING: Using LIVE Stripe key. Be careful - this will charge real cards!');
  console.warn('For testing, use Stripe TEST mode in dashboard: https://dashboard.stripe.com/test/apikeys');
}

const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: '2023-10-16',
}) : null;

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
    // Log environment variable status
    console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
    console.log('STRIPE_SECRET_KEY starts with:', process.env.STRIPE_SECRET_KEY?.substring(0, 7));
    
    // Check if Stripe is initialized
    if (!stripe) {
      console.error('Stripe is not initialized. Check your STRIPE_SECRET_KEY environment variable.');
      console.error('Environment key:', process.env.STRIPE_SECRET_KEY ? 'exists' : 'missing');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Payment processing is not configured',
          details: 'Stripe secret key is missing or invalid',
          keyStatus: process.env.STRIPE_SECRET_KEY ? 'exists but invalid' : 'missing'
        }),
      };
    }

    const { amount, currency = 'usd', metadata } = JSON.parse(event.body);

    if (!amount || amount <= 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid amount' }),
      };
    }

    console.log(`Creating payment intent for amount: ${amount} ${currency}`);

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: metadata || {},
    });

    console.log('Payment intent created successfully:', paymentIntent.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    console.error('Error type:', error.type);
    console.error('Error message:', error.message);
    
    // Check for specific Stripe errors
    if (error.type === 'StripeAuthenticationError') {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          error: 'Authentication failed',
          details: 'Invalid API key. Please check your Stripe configuration.'
        }),
      };
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to create payment intent',
        details: error.message 
      }),
    };
  }
};