# 🚨 URGENT: Add Your Stripe TEST Keys to Fix Checkout

The checkout is stuck because you need to add your actual Stripe TEST keys to the `.env` file.

## Quick Steps:

1. **Open this link:** https://dashboard.stripe.com/test/apikeys

2. **Make sure you're in TEST MODE** (toggle in top right corner should say "Test mode")

3. **Copy these two keys:**
   - Publishable key (starts with `pk_test_`)
   - Secret key (starts with `sk_test_` - click "Reveal test key")

4. **Open your `.env` file and replace the placeholders:**
   
   Change this:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_PUBLISHABLE_KEY_HERE
   STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY_HERE
   ```
   
   To something like this (with YOUR actual keys):
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51QltQuCdDU82ConmABCD1234...
   STRIPE_SECRET_KEY=sk_test_51QltQuCdDU82ConmXYZ789...
   ```

5. **Kill all dev servers** (Ctrl+C in all terminal windows)

6. **Start fresh:** Run `npm run dev`

7. **Test with these cards:**
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

## Why This Is Happening:

- You had LIVE keys before (dangerous for testing!)
- I replaced them with placeholders for safety
- Now you need to add your actual TEST keys
- TEST keys let you test without charging real cards

## Still Not Working?

If checkout still shows "preparing checkout" after adding keys:
1. Make sure you saved the .env file
2. Make sure you killed ALL running dev servers
3. Clear your browser cache (Ctrl+Shift+R)
4. Check browser console for any errors