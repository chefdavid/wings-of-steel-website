# Stripe Test Mode Setup

## Important: You're currently using a LIVE Stripe key!

For testing, you need to use Stripe TEST keys, not LIVE keys.

## How to Get Your Test Keys:

1. Go to https://dashboard.stripe.com/test/apikeys
2. Make sure you're in **Test Mode** (toggle in the top right)
3. Copy your test keys:
   - **Publishable key**: starts with `pk_test_`
   - **Secret key**: starts with `sk_test_`

## Update Your .env File:

Replace your current keys with test keys:

```env
# IMPORTANT: Use TEST keys for development
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY
```

## Test Credit Cards:

Once you have test keys, use these cards to test:

- **Success**: `4242 4242 4242 4242`
- **Requires auth**: `4000 0025 0000 3155`
- **Declined**: `4000 0000 0000 9995`

Use any future expiry (e.g., 12/34), any CVC (e.g., 123), any ZIP.

## Current Issue:

Your .env has:
- `STRIPE_SECRET_KEY=sk_live_...` (LIVE KEY - DON'T USE FOR TESTING!)

You need:
- `STRIPE_SECRET_KEY=sk_test_...` (TEST KEY)

## Security Note:

NEVER commit your live keys to git. The live key can charge real credit cards!