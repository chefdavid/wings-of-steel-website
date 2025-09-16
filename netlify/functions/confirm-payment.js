import { createClient } from '@supabase/supabase-js';

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
    const { paymentIntentId } = JSON.parse(event.body);

    if (!paymentIntentId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Payment Intent ID is required' }),
      };
    }

    console.log('Confirming payment:', paymentIntentId);

    // Update the registration status in Supabase
    const { data, error } = await supabase
      .from('event_registrations')
      .update({
        payment_status: 'succeeded',
        updated_at: new Date().toISOString()
      })
      .eq('payment_intent_id', paymentIntentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment status:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to confirm payment',
          details: error.message 
        }),
      };
    }

    console.log('Payment confirmed successfully:', data);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        registration: data 
      }),
    };
  } catch (error) {
    console.error('Error confirming payment:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to confirm payment',
        details: error.message
      }),
    };
  }
};