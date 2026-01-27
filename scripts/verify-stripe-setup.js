import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublishableKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

console.log('🔍 Stripe Configuration Verification\n');
console.log('=' .repeat(50));

// Check if keys are set
console.log('\n📋 Environment Variables:');
console.log('─'.repeat(50));

if (stripePublishableKey) {
  const keyType = stripePublishableKey.startsWith('pk_test_') ? 'TEST' : 
                   stripePublishableKey.startsWith('pk_live_') ? 'LIVE' : 'UNKNOWN';
  console.log(`✅ VITE_STRIPE_PUBLISHABLE_KEY: ${keyType} key found`);
  console.log(`   Key: ${stripePublishableKey.substring(0, 20)}...`);
} else {
  console.log('❌ VITE_STRIPE_PUBLISHABLE_KEY: MISSING');
}

if (stripeSecretKey) {
  const keyType = stripeSecretKey.startsWith('sk_test_') ? 'TEST' : 
                   stripeSecretKey.startsWith('sk_live_') ? 'LIVE' : 'UNKNOWN';
  console.log(`✅ STRIPE_SECRET_KEY: ${keyType} key found`);
  console.log(`   Key: ${stripeSecretKey.substring(0, 20)}...`);
} else {
  console.log('❌ STRIPE_SECRET_KEY: MISSING');
}

if (webhookSecret) {
  console.log(`✅ STRIPE_WEBHOOK_SECRET: Found`);
  console.log(`   Secret: ${webhookSecret.substring(0, 20)}...`);
} else {
  console.log('⚠️  STRIPE_WEBHOOK_SECRET: Not set (optional for local testing)');
}

// Verify Stripe connection
if (stripeSecretKey) {
  console.log('\n🔌 Stripe API Connection:');
  console.log('─'.repeat(50));
  
  try {
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Test API connection
    const account = await stripe.account.retrieve();
    console.log(`✅ Connected to Stripe account: ${account.id}`);
    console.log(`   Account type: ${account.type}`);
    console.log(`   Country: ${account.country}`);
    console.log(`   Email: ${account.email || 'Not set'}`);
    
    // Check if test or live mode
    const isTestMode = stripeSecretKey.startsWith('sk_test_');
    console.log(`\n📊 Mode: ${isTestMode ? 'TEST MODE' : 'LIVE MODE'}`);
    
    if (isTestMode) {
      console.log('   ⚠️  Using TEST keys - no real charges will be made');
    } else {
      console.log('   ⚠️  Using LIVE keys - REAL charges will be made!');
    }

    // List webhooks
    console.log('\n🔗 Webhook Endpoints:');
    console.log('─'.repeat(50));
    
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    
    if (webhooks.data.length === 0) {
      console.log('❌ No webhook endpoints found');
      console.log('   You need to create a webhook endpoint in Stripe Dashboard');
      console.log('   URL: https://www.wingsofsteel.org/.netlify/functions/donation-webhook');
    } else {
      console.log(`✅ Found ${webhooks.data.length} webhook endpoint(s):\n`);
      
      const donationWebhooks = webhooks.data.filter(
        w => w.url.includes('donation-webhook') || w.url.includes('wingsofsteel.org')
      );
      
      if (donationWebhooks.length === 0) {
        console.log('   ⚠️  No donation webhook found');
        console.log('   Expected URL: https://www.wingsofsteel.org/.netlify/functions/donation-webhook\n');
      }
      
      webhooks.data.forEach((webhook, index) => {
        const isDonationWebhook = webhook.url.includes('donation-webhook');
        const prefix = isDonationWebhook ? '🎯' : '   ';
        
        console.log(`${prefix} ${index + 1}. ${webhook.url}`);
        console.log(`      Status: ${webhook.status === 'enabled' ? '✅ Enabled' : '❌ Disabled'}`);
        console.log(`      Events: ${webhook.enabled_events.length} event(s)`);
        if (webhook.description) {
          console.log(`      Description: ${webhook.description}`);
        }
        
        // Check if it's the correct URL
        const isCorrectUrl = webhook.url.includes('wingsofsteel.org') && 
                            webhook.url.includes('donation-webhook');
        if (isCorrectUrl) {
          console.log(`      ✅ Correct endpoint URL`);
        } else if (webhook.url.includes('wingsofsteel.org')) {
          console.log(`      ⚠️  URL doesn't match expected endpoint`);
          console.log(`      Expected: .../donation-webhook`);
        }
        
        // Check required events (only for donation webhooks)
        if (isDonationWebhook) {
          const requiredEvents = [
            'payment_intent.succeeded',
            'payment_intent.payment_failed',
            'invoice.payment_succeeded',
            'invoice.payment_failed',
            'customer.subscription.created',
            'customer.subscription.updated',
            'customer.subscription.deleted'
          ];
          
          const missingEvents = requiredEvents.filter(
            event => !webhook.enabled_events.includes(event) && 
                     !webhook.enabled_events.includes('*')
          );
          
          if (missingEvents.length === 0) {
            console.log(`      ✅ All required events configured`);
          } else {
            console.log(`      ⚠️  Missing events: ${missingEvents.join(', ')}`);
          }
        }
        
        console.log('');
      });
    }

    // Check products and prices (for recurring donations)
    console.log('💳 Products & Prices:');
    console.log('─'.repeat(50));
    
    const products = await stripe.products.list({ limit: 10, active: true });
    const donationProducts = products.data.filter(
      p => p.metadata?.type === 'donation' || p.name.includes('Donation')
    );
    
    if (donationProducts.length > 0) {
      console.log(`✅ Found ${donationProducts.length} donation product(s)`);
      donationProducts.forEach(product => {
        console.log(`   - ${product.name} (${product.id})`);
      });
    } else {
      console.log('ℹ️  No donation products found (will be created automatically)');
    }

    console.log('\n✅ Stripe configuration verified successfully!');
    
  } catch (error) {
    console.error('\n❌ Error connecting to Stripe:');
    console.error(`   ${error.message}`);
    
    if (error.type === 'StripeAuthenticationError') {
      console.error('\n   ⚠️  Authentication failed - check your STRIPE_SECRET_KEY');
    } else if (error.type === 'StripeAPIError') {
      console.error('\n   ⚠️  API error - check your Stripe account status');
    }
  }
} else {
  console.log('\n❌ Cannot verify Stripe connection - STRIPE_SECRET_KEY is missing');
}

console.log('\n' + '='.repeat(50));
console.log('\n📝 Next Steps:');
console.log('─'.repeat(50));
console.log('1. Ensure all environment variables are set in .env file');
console.log('2. Add the same variables to Netlify environment variables');
console.log('3. Create webhook endpoint in Stripe Dashboard');
console.log('4. Test with test card: 4242 4242 4242 4242');
console.log('\n');

