import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

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
        await handlePaymentIntentSucceeded(stripeEvent.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(stripeEvent.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(stripeEvent.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(stripeEvent.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(stripeEvent.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };

  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook handler failed' }),
    };
  }
};

// Handle successful one-time payment
async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);

  // Check if this is a donation payment
  if (paymentIntent.metadata?.donation_type) {
    try {
      // Update donation status
      const { error: updateError } = await supabase
        .from('donations')
        .update({
          payment_status: 'succeeded',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_payment_intent_id', paymentIntent.id);

      if (updateError) {
        console.error('Error updating donation status:', updateError);
        return;
      }

      console.log('Donation status updated to succeeded');

      // Fetch donation details and send emails
      try {
        const { data: donation, error: fetchError } = await supabase
          .from('donations')
          .select('*')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single();

        if (!fetchError && donation) {
          // Send thank you email to donor
          await sendThankYouEmail(donation);
          // Send notification to admins
          await sendAdminNotification(donation);
        }
      } catch (emailError) {
        console.error('Error sending emails:', emailError);
        // Don't fail the webhook if email fails
      }
      
    } catch (dbError) {
      console.error('Database error:', dbError);
    }
  }
}

// Handle failed payment
async function handlePaymentIntentFailed(paymentIntent) {
  console.log('Payment failed:', paymentIntent.id);

  if (paymentIntent.metadata?.donation_type) {
    try {
      const { error } = await supabase
        .from('donations')
        .update({
          payment_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_payment_intent_id', paymentIntent.id);

      if (error) {
        console.error('Error updating donation status:', error);
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
    }
  }
}

// Handle subscription created
async function handleSubscriptionCreated(subscription) {
  console.log('Subscription created:', subscription.id);

  if (subscription.metadata?.donation_type === 'recurring') {
    try {
      // Update donation record with subscription ID if not already set
      const { error } = await supabase
        .from('donations')
        .update({
          stripe_subscription_id: subscription.id,
          payment_status: 'succeeded',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_payment_intent_id', subscription.latest_invoice?.payment_intent);

      if (error) {
        console.error('Error updating donation with subscription:', error);
      }

      // Update subscription record
      const { error: subError } = await supabase
        .from('donation_subscriptions')
        .update({
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id);

      if (subError) {
        console.error('Error updating subscription record:', subError);
      }

      console.log('Subscription linked to donation');
    } catch (dbError) {
      console.error('Database error:', dbError);
    }
  }
}

// Handle successful recurring payment (invoice paid)
async function handleInvoicePaymentSucceeded(invoice) {
  console.log('Invoice payment succeeded:', invoice.id);

  if (invoice.subscription && invoice.metadata?.donation_type === 'recurring') {
    try {
      // Find the original donation by subscription ID
      const { data: donation, error: findError } = await supabase
        .from('donations')
        .select('id')
        .eq('stripe_subscription_id', invoice.subscription)
        .single();

      if (findError || !donation) {
        console.error('Error finding donation for subscription:', findError);
        return;
      }

      // Create a new donation record for this recurring payment
      const subscriptionData = await supabase
        .from('donation_subscriptions')
        .select('donation_id, stripe_customer_id')
        .eq('stripe_subscription_id', invoice.subscription)
        .single();

      if (subscriptionData.data) {
        const originalDonation = await supabase
          .from('donations')
          .select('*')
          .eq('id', subscriptionData.data.donation_id)
          .single();

        if (originalDonation.data) {
          const recurringDonation = {
            donor_name: originalDonation.data.donor_name,
            donor_email: originalDonation.data.donor_email,
            donor_phone: originalDonation.data.donor_phone,
            company_name: originalDonation.data.company_name,
            amount: invoice.amount_paid / 100, // Convert from cents
            donation_type: 'recurring',
            player_name: originalDonation.data.player_name,
            is_anonymous: originalDonation.data.is_anonymous,
            stripe_payment_intent_id: invoice.payment_intent,
            stripe_subscription_id: invoice.subscription,
            payment_status: 'succeeded',
            campaign_id: originalDonation.data.campaign_id
          };

          const { error: insertError } = await supabase
            .from('donations')
            .insert(recurringDonation);

          if (insertError) {
            console.error('Error creating recurring donation record:', insertError);
          } else {
            console.log('Recurring donation record created');
            // Trigger thank you email for recurring payment
          }
        }
      }

      // Update subscription current_period_end
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      await supabase
        .from('donation_subscriptions')
        .update({
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', invoice.subscription);

    } catch (dbError) {
      console.error('Database error:', dbError);
    }
  }
}

// Handle subscription canceled
async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', subscription.id);

  try {
    const { error } = await supabase
      .from('donation_subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Error updating subscription status:', error);
    }
  } catch (dbError) {
    console.error('Database error:', dbError);
  }
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice) {
  console.log('Invoice payment failed:', invoice.id);

  if (invoice.subscription) {
    try {
      const { error } = await supabase
        .from('donation_subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', invoice.subscription);

      if (error) {
        console.error('Error updating subscription status:', error);
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
    }
  }
}

// Admin email addresses for notifications
const ADMIN_EMAILS = [
  'jeanmwiederholt@gmail.com',
  'sjsledhockey@hotmail.com',
  'pkjlp@comcast.net'
];

// Send admin notification email via Resend
async function sendAdminNotification(donation) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured for admin notification');
    return;
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@wingsofsteel.org';
  const donorName = donation.is_anonymous ? 'Anonymous' : donation.donor_name;

  const amount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(donation.amount);

  const isRecurring = donation.donation_type === 'recurring';
  const eventTag = donation.event_tag;
  const eventSource = eventTag === 'topgolf-youth' ? 'TopGolf Fundraiser — Youth'
    : eventTag === 'topgolf-adult' ? 'TopGolf Fundraiser — Adult'
    : eventTag === 'golf-outing' ? 'Tom Brake Memorial Golf Outing'
    : eventTag === 'hockey-for-a-cause' ? 'Hockey for a Cause'
    : eventTag ? eventTag.replace(/-/g, ' ')
    : 'General Donation';

  const adminEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Donation Received</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #1e3a5f; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #ffd700; margin: 0; font-size: 24px;">💰 New Donation Received!</h1>
      </div>

      <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <div style="background: #d4edda; padding: 20px; border-radius: 5px; margin-bottom: 20px; text-align: center;">
          <p style="margin: 0; font-size: 32px; font-weight: bold; color: #155724;">${amount}</p>
          <p style="margin: 5px 0 0 0; color: #155724;">${isRecurring ? 'Monthly Recurring Donation' : 'One-Time Donation'}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Donor:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${donorName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${donation.donor_email}</td>
          </tr>
          ${donation.donor_phone ? `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${donation.donor_phone}</td>
          </tr>
          ` : ''}
          ${donation.company_name ? `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Company:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${donation.company_name}</td>
          </tr>
          ` : ''}
          ${donation.player_name ? `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">In Honor Of:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${donation.player_name}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Source:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${eventSource}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Date:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${new Date(donation.created_at).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Payment ID:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 12px; font-family: monospace;">${donation.stripe_payment_intent_id}</td>
          </tr>
        </table>

        ${donation.message ? `
        <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold;">Donor Message:</p>
          <p style="margin: 5px 0 0 0; font-style: italic;">"${donation.message}"</p>
        </div>
        ` : ''}

        <p style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          This is an automated notification from the Wings of Steel website.
        </p>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: ADMIN_EMAILS,
        subject: `💰 New ${eventSource}: ${amount} from ${donorName}`,
        html: adminEmailHtml,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Admin notification email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    // Don't throw - we don't want to fail the webhook if admin email fails
  }
}

// Send thank you email via Resend
async function sendThankYouEmail(donation) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured');
    return;
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@wingsofsteel.org';
  const toEmail = donation.donor_email;
  const donorName = donation.is_anonymous ? 'Valued Supporter' : donation.donor_name;

  const amount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(donation.amount);

  const isRecurring = donation.donation_type === 'recurring';
  const playerHonor = donation.player_name ? ` in honor of ${donation.player_name}` : '';
  const companyName = donation.company_name ? ` on behalf of ${donation.company_name}` : '';

  const thankYouEventTag = donation.event_tag;
  const thankYouSubject = thankYouEventTag === 'golf-outing'
    ? `Thank You for Registering — Tom Brake Memorial Golf Outing - ${amount}`
    : thankYouEventTag === 'hockey-for-a-cause'
    ? `Thank You — Hockey for a Cause - ${amount}`
    : thankYouEventTag && thankYouEventTag.startsWith('topgolf')
    ? `Thank You for Registering — TopGolf Fundraiser - ${amount}`
    : `Thank You for Your Donation to Wings of Steel - ${amount}`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You for Your Donation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 28px;">Thank You!</h1>
      </div>
      
      <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; margin-bottom: 20px;">Dear ${donorName},</p>
        
        <p style="margin-bottom: 20px;">
          On behalf of Wings of Steel, we want to express our heartfelt gratitude for your generous donation of <strong>${amount}</strong>${playerHonor}${companyName}.
        </p>

        ${isRecurring ? `
        <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #1976d2; font-weight: bold;">
            Monthly Recurring Donation
          </p>
          <p style="margin: 5px 0 0 0; color: #1976d2;">
            Your donation will be automatically processed each month. You can cancel or modify your recurring donation at any time by contacting us.
          </p>
        </div>
        ` : ''}

        <p style="margin-bottom: 20px;">
          Your support makes it possible for us to provide equipment, ice time, and opportunities to athletes with disabilities. <strong>100% of your donation goes directly to supporting our players</strong> - we cover all processing fees.
        </p>

        <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e3a5f;">Donation Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Amount:</td>
              <td style="padding: 8px 0; text-align: right;">${amount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Type:</td>
              <td style="padding: 8px 0; text-align: right;">${isRecurring ? 'Monthly Recurring' : 'One-Time'}</td>
            </tr>
            ${donation.player_name ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">In Honor Of:</td>
              <td style="padding: 8px 0; text-align: right;">${donation.player_name}</td>
            </tr>
            ` : ''}
            ${donation.company_name ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Company:</td>
              <td style="padding: 8px 0; text-align: right;">${donation.company_name}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Date:</td>
              <td style="padding: 8px 0; text-align: right;">${new Date(donation.created_at).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Payment ID:</td>
              <td style="padding: 8px 0; text-align: right; font-size: 12px; font-family: monospace;">${donation.stripe_payment_intent_id}</td>
            </tr>
          </table>
        </div>

        <p style="margin-bottom: 20px;">
          <strong>Tax Deduction:</strong> Wings of Steel is a 501(c)(3) nonprofit organization. This receipt serves as documentation for your tax-deductible donation. Please keep this email for your records.
        </p>

        ${donation.message ? `
        <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <p style="margin: 0; font-style: italic;">"${donation.message}"</p>
        </div>
        ` : ''}

        <p style="margin-bottom: 20px;">
          Thank you again for your generosity and for helping us break barriers and build champions!
        </p>

        <p style="margin-bottom: 0;">
          With gratitude,<br>
          <strong>The Wings of Steel Team</strong>
        </p>
      </div>

      <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
        <p>Wings of Steel<br>
        Email: info@wingsofsteel.org<br>
        Website: <a href="https://wingsofsteel.org" style="color: #1e3a5f;">wingsofsteel.org</a></p>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: toEmail,
        subject: thankYouSubject,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Thank you email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending thank you email:', error);
    throw error;
  }
}

