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

  // Handle preflight
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
      donorInfo,
      donationType, // 'one-time' or 'recurring'
      campaignId,
      isRecurring = false,
      eventTag = null,
      itemName = null,
      golfRegistrationId = null,
      ticketCount = null,
      ticketAmount = null,
      donationAmount = null
    } = JSON.parse(event.body);

    // Validate required fields
    if (!amount || amount <= 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid donation amount' }),
      };
    }

    if (!donorInfo || !donorInfo.name || !donorInfo.email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Donor information is required' }),
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

    console.log(`Creating ${donationType} donation for: ${donorInfo.name}, amount: $${amount}`);

    let paymentIntent;
    let subscription = null;
    let customer = null;

    if (isRecurring && donationType === 'recurring') {
      // Create or retrieve Stripe customer
      const customerSearch = await stripe.customers.list({
        email: donorInfo.email,
        limit: 1,
      });

      if (customerSearch.data.length > 0) {
        customer = customerSearch.data[0];
      } else {
        customer = await stripe.customers.create({
          email: donorInfo.email,
          name: donorInfo.name,
          phone: donorInfo.phone || undefined,
          metadata: {
            company_name: donorInfo.companyName || '',
            source: 'wings_of_steel_donation'
          }
        });
      }

      // Create Stripe subscription for monthly recurring donation
      const priceId = await getOrCreatePriceId(stripe, amount);
      
      subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          donation_type: 'recurring',
          donor_name: donorInfo.name,
          donor_email: donorInfo.email,
          company_name: donorInfo.companyName || '',
          player_name: donorInfo.playerName || '',
          campaign_id: campaignId || '',
          event_tag: eventTag || '',
          is_anonymous: donorInfo.isAnonymous ? 'true' : 'false'
        }
      });

      paymentIntent = subscription.latest_invoice.payment_intent;
    } else {
      // Determine the description based on eventTag.
      // Keep the event name in the description -- it is what shows on the Stripe
      // dashboard, the payout report and the cardholder's statement, and it is the
      // only way to tell two years of Topgolf revenue apart at a glance.
      let description;
      if (eventTag === 'topgolf-oct-2026') {
        const parts = [];
        if (ticketCount) parts.push(`${ticketCount} x $25 ticket${ticketCount === 1 ? '' : 's'}`);
        if (donationAmount > 0) parts.push(`$${donationAmount} donation`);
        description = `Topgolf Fundraiser Oct 25 2026 (Youth Team)${parts.length ? ` - ${parts.join(' + ')}` : ''} - Wings of Steel`;
      } else if (eventTag && eventTag.startsWith('topgolf')) {
        const team = eventTag.includes('youth') ? 'Youth' : eventTag.includes('adult') ? 'Adult' : '';
        description = `TopGolf Fundraiser Mar 8 2026 Registration${team ? ` - ${team} Team` : ''} - Wings of Steel`;
      } else if (eventTag === 'golf-outing') {
        description = itemName
          ? `Golf Outing Sponsorship: ${itemName} - Wings of Steel`
          : `Tom Brake Memorial Golf Outing Registration - Wings of Steel`;
      } else if (eventTag === 'hockey-for-a-cause') {
        description = `Hockey for a Cause - Entry Donation - Wings of Steel`;
      } else {
        description = `Donation to Wings of Steel${donorInfo.playerName ? ` - In honor of ${donorInfo.playerName}` : ''}`;
      }

      // Create one-time payment intent
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
        description,
        metadata: {
          donation_type: 'one-time',
          donor_name: donorInfo.name,
          donor_email: donorInfo.email,
          donor_phone: donorInfo.phone || '',
          company_name: donorInfo.companyName || '',
          player_name: donorInfo.playerName || '',
          message: donorInfo.message || '',
          campaign_id: campaignId || '',
          event_tag: eventTag || '',
          item_name: itemName || '',
          is_anonymous: donorInfo.isAnonymous ? 'true' : 'false',
          golf_registration_id: golfRegistrationId || '',
          ticket_count: ticketCount != null ? String(ticketCount) : '',
          ticket_amount: ticketAmount != null ? String(ticketAmount) : '',
          addon_donation: donationAmount != null ? String(donationAmount) : ''
        },
        receipt_email: donorInfo.email,
      });
    }

    console.log(`${donationType === 'recurring' ? 'Subscription' : 'Payment intent'} created:`, paymentIntent.id);

    // Store donation record in database
    const donationData = {
      donor_name: donorInfo.name,
      donor_email: donorInfo.email,
      donor_phone: donorInfo.phone || null,
      company_name: donorInfo.companyName || null,
      amount: amount,
      donation_type: donationType,
      player_name: donorInfo.playerName || null,
      is_anonymous: donorInfo.isAnonymous || false,
      message: donorInfo.message || null,
      stripe_payment_intent_id: paymentIntent.id,
      stripe_subscription_id: subscription ? subscription.id : null,
      payment_status: 'pending',
      campaign_id: campaignId || null,
      event_tag: eventTag || null,
      ticket_count: ticketCount ?? null,
      ticket_amount: ticketAmount ?? null,
      addon_donation: donationAmount ?? null
    };

    const { data: donation, error: insertError } = await supabase
      .from('donations')
      .insert(donationData)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting donation:', insertError);
      throw insertError;
    }

    // Link the Stripe payment intent back to the golf_registrations row
    // so the webhook can find it later by stripe_payment_intent_id.
    if (golfRegistrationId) {
      const { error: linkError } = await supabase
        .from('golf_registrations')
        .update({ stripe_payment_intent_id: paymentIntent.id })
        .eq('id', golfRegistrationId);

      if (linkError) {
        console.error('Error linking payment intent to golf_registration:', linkError);
        // Non-fatal: webhook can still match by metadata.golf_registration_id
      }
    }

    // If recurring, also create subscription record
    if (subscription) {
      const { error: subError } = await supabase
        .from('donation_subscriptions')
        .insert({
          donation_id: donation.id,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: customer.id,
          status: 'active',
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        });

      if (subError) {
        console.error('Error inserting subscription:', subError);
        // Don't throw - donation is already created
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        donationId: donation.id,
        subscriptionId: subscription ? subscription.id : null,
        customerId: customer ? customer.id : null
      }),
    };

  } catch (error) {
    console.error('Error creating donation payment:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to create donation payment',
        details: error.message
      }),
    };
  }
};

// Helper function to get or create Stripe price for recurring donations
async function getOrCreatePriceId(stripe, amount) {
  // Check if price already exists for this amount
  const amountInCents = Math.round(amount * 100);
  const prices = await stripe.prices.list({
    active: true,
    type: 'recurring',
    limit: 100,
  });

  // Look for existing price with same amount and monthly interval
  const existingPrice = prices.data.find(
    price => price.unit_amount === amountInCents && 
             price.recurring?.interval === 'month'
  );

  if (existingPrice) {
    return existingPrice.id;
  }

  // Create new price if it doesn't exist
  const product = await getOrCreateProduct(stripe);
  
  const price = await stripe.prices.create({
    unit_amount: amountInCents,
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    product: product.id,
    metadata: {
      donation_type: 'monthly_recurring'
    }
  });

  return price.id;
}

// Helper function to get or create Stripe product for donations
async function getOrCreateProduct(stripe) {
  const products = await stripe.products.list({
    active: true,
    limit: 100,
  });

  const existingProduct = products.data.find(
    product => product.metadata?.type === 'donation'
  );

  if (existingProduct) {
    return existingProduct;
  }

  // Create new product
  const product = await stripe.products.create({
    name: 'Wings of Steel Monthly Donation',
    description: 'Monthly recurring donation to support Wings of Steel Youth Sled Hockey',
    metadata: {
      type: 'donation',
      organization: 'wings_of_steel'
    }
  });

  return product;
}



