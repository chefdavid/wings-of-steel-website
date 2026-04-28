# Testing Stripe Integration for Pizza, Pins & Pop

## Prerequisites
1. Ensure you have **test keys** in your `.env` file:
   - `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`
   - `STRIPE_SECRET_KEY=sk_test_...` (in Netlify environment)

## Step-by-Step Testing Guide

### 1. Local Testing
```bash
# Start the development server
npm run dev
```

### 2. Navigate to the Event Page
- Go to: http://localhost:5173/pizza-pins-pop
- You should see the Pizza, Pins & Pop fundraiser page

### 3. Fill Out Registration Form
- **Customer Information:**
  - Name: Test Customer
  - Email: test@example.com
  - Phone: 555-1234
  - Company: Test Company (optional)
  - Team Members: List some names (optional)
  - Special Requests: Any notes (optional)

### 4. Enter Test Payment
Use Stripe's test card:
```
Card Number: 4242 4242 4242 4242
Expiry: 12/34 (any future date)
CVC: 123 (any 3 digits)
ZIP: 12345 (any 5 digits)
```

### 5. Complete the Purchase
- Click "Complete Purchase"
- You should see a success message
- Check for confirmation email (if configured)

### 6. Verify in Stripe Dashboard
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/payments)
2. Switch to **Test Mode** (toggle in top right)
3. You should see your test payment
4. Check the metadata includes:
   - Customer name
   - Event details
   - Package information

### 7. Check Database (if Supabase is configured)
1. Go to Admin Dashboard: http://localhost:5173/admin
2. Navigate to "Pizza Pins Sales"
3. You should see the test registration

## Testing Different Scenarios

### Test Successful Payment
```
Card: 4242 4242 4242 4242
Expected: Payment succeeds immediately
```

### Test Failed Payment
```
Card: 4000 0000 0000 0002
Expected: Payment is declined
```

### Test 3D Secure (European cards)
```
Card: 4000 0025 0000 3155
Expected: Requires authentication
```

### Test Insufficient Funds
```
Card: 4000 0000 0000 9995
Expected: Decline with insufficient_funds
```

## Common Issues & Solutions

### Issue: "Stripe is not defined"
**Solution:** Check that your publishable key is set correctly:
```javascript
console.log(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
```

### Issue: Payment fails in production but works locally
**Solution:** Ensure production environment variables are set in Netlify:
1. Go to Netlify Dashboard
2. Site settings → Environment variables
3. Add all required keys

### Issue: No confirmation email
**Solution:** Check Netlify Form notifications:
1. Go to Netlify Dashboard
2. Forms → Settings
3. Configure email notifications

### Issue: Database not updating
**Solution:** Check Supabase connection:
1. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Run the CREATE_TABLE.sql in Supabase SQL editor
3. Check browser console for errors

## Testing Webhook (Production Only)
1. Configure webhook endpoint in Stripe Dashboard
2. Set webhook URL: `https://your-site.netlify.app/.netlify/functions/stripe-webhook`
3. Add webhook secret to Netlify environment: `STRIPE_WEBHOOK_SECRET`

## Test Checklist
- [ ] Form validation works
- [ ] Payment processes successfully
- [ ] Success message displays
- [ ] Email notifications sent (if configured)
- [ ] Database record created (if configured)
- [ ] Dashboard shows registration (admin only)
- [ ] Different card scenarios tested
- [ ] Mobile responsive layout works

## Important Notes
- **Never use real card numbers in test mode**
- **Test mode payments don't charge real money**
- **Test data is separate from live data**
- **Switch to live keys only when ready for production**

## Quick Test Commands
```bash
# Check if Stripe is loaded
# Open browser console and type:
window.Stripe

# Test the payment endpoint directly
curl -X POST http://localhost:8888/.netlify/functions/pizza-pins-payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 15000,
    "customerInfo": {
      "name": "Test User",
      "email": "test@example.com"
    },
    "packageName": "Lane Reservation"
  }'
```