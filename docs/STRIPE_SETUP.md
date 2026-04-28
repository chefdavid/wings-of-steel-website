# Stripe Setup for Pizza, Pins & Pop Event

## ✅ What's Been Set Up

### 1. **Payment Processing Backend**
- Created `netlify/functions/pizza-pins-payment.js` - Dedicated endpoint for Pizza, Pins & Pop payments
- Created `netlify/functions/stripe-webhook.js` - Webhook handler for payment confirmations
- Both functions store registration data in Supabase database

### 2. **Frontend Integration**
- Updated Pizza, Pins & Pop page to use the new payment endpoint
- Integrated Stripe Elements for secure card processing
- Added customer information collection form
- Implemented success/failure handling

### 3. **Database Storage**
- Registrations are saved to Supabase `event_registrations` table
- Stores: customer info, package selection, add-ons, payment status
- Automatically updates payment status via webhook

## ⚠️ IMPORTANT: Current Configuration

**YOU ARE USING LIVE STRIPE KEYS!**
- Current keys in `.env` are LIVE production keys
- This will charge REAL credit cards
- For testing, you should switch to TEST keys

## 🔧 To Complete Setup

### 1. **For Testing (Recommended First)**

1. Go to [Stripe Dashboard TEST Mode](https://dashboard.stripe.com/test/apikeys)
2. Get your TEST API keys (they start with `pk_test_` and `sk_test_`)
3. Update `.env` file:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_KEY
   STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY
   ```

### 2. **Set Up Stripe Webhook**

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter endpoint URL: `https://your-site.netlify.app/.netlify/functions/stripe-webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret (starts with `whsec_`)
6. Add to `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
   ```

### 3. **Deploy to Netlify**

1. Commit all changes
2. Push to GitHub
3. Netlify will auto-deploy
4. Add environment variables in Netlify dashboard:
   - Go to Site Settings > Environment Variables
   - Add all Stripe keys and Supabase credentials

### 4. **Test the Flow**

**With TEST keys:**
1. Visit `/pizza-pins-pop`
2. Fill out the registration form
3. Use test card: `4242 4242 4242 4242`
4. Any future date, any CVC

**With LIVE keys (be careful!):**
- Only use when ready for production
- Test with a small amount first
- Consider using Stripe's "Capture later" mode initially

## 📊 View Registrations

Registrations are stored in Supabase. To view them:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Table Editor
4. View `event_registrations` table

Or create an admin page using the following query:
```sql
SELECT * FROM event_registrations
WHERE event_name = 'Pizza, Pins & Pop 2024'
ORDER BY created_at DESC;
```

## 🎯 Event Page Features

- Single $150 package (as per flyer)
- Raffle tickets and strike challenge add-ons
- Optional donation field
- Team photo display
- Animated bowling theme
- Real-time fundraising progress
- Mobile-responsive design
- Prominent CTA in navigation

## 💰 Revenue Tracking

Each successful payment stores:
- Total amount
- Package selected
- Add-ons purchased
- Additional donations
- Customer contact info
- Special requests

## 📧 Next Steps (Optional)

1. **Email Confirmations**: Integrate SendGrid or similar for automatic confirmation emails
2. **Admin Dashboard**: Create a page to view all registrations
3. **QR Codes**: Generate unique QR codes for each registration
4. **Capacity Tracking**: Show remaining lanes available
5. **Early Bird Pricing**: Add time-based discounts

## 🚨 Security Notes

- Never commit live Stripe keys to GitHub
- Use environment variables for all sensitive data
- Test thoroughly with TEST keys first
- Enable Stripe Radar for fraud protection
- Set up payment alerts in Stripe Dashboard

## 📞 Support

- Stripe Support: https://support.stripe.com
- Stripe Docs: https://stripe.com/docs
- Test Cards: https://stripe.com/docs/testing#cards

The Pizza, Pins & Pop fundraiser page is ready at `/pizza-pins-pop`!