# Stripe Payment Integration Setup

## Prerequisites
- Stripe account (sign up at [stripe.com](https://stripe.com))
- Printify store configured (see PRINTIFY_SETUP.md)

## Setup Instructions

### 1. Get Your Stripe API Keys

1. Log into your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers > API Keys**
3. Copy your keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

⚠️ **Important**: Use test keys for development and live keys for production.

### 2. Configure Environment Variables

Add these to your `.env` file:

```bash
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
```

For Netlify deployment, add these in:
**Site Settings > Environment Variables**

### 3. Test the Integration

#### Test Mode
1. Use Stripe's test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Any future expiry date and any 3-digit CVC

2. Complete a test purchase:
   - Add products to cart
   - Go to checkout
   - Fill shipping information
   - Enter test card details
   - Complete payment

### 4. Payment Flow

The integration works as follows:

1. **Cart → Checkout**: Customer proceeds with items
2. **Shipping Info**: Collects delivery address
3. **Payment**: Stripe Elements secure payment form
4. **Processing**:
   - Payment charged via Stripe
   - Order created in Printify
   - Customer receives confirmation

### 5. Order Management

- **Stripe Dashboard**: View all payments and customer details
- **Printify Dashboard**: View orders for fulfillment
- **Order Linking**: Each Printify order includes the Stripe Payment ID

### 6. Going Live

When ready for production:

1. **In Stripe**:
   - Complete account activation
   - Switch to live API keys
   - Set up tax settings if needed

2. **In Your App**:
   - Update `.env` with live keys
   - Test with a real card (small amount)
   - Monitor first few orders

### 7. Additional Features

Consider adding:
- Email receipts (Stripe handles this)
- Webhook handling for order status
- Refund management
- Subscription products

## Security Notes

- Never commit API keys to git
- Use environment variables only
- Enable Stripe Radar for fraud protection
- Review Stripe's security best practices

## Support

- Stripe Support: [stripe.com/support](https://stripe.com/support)
- Stripe Docs: [stripe.com/docs](https://stripe.com/docs)
- Test Cards: [stripe.com/docs/testing](https://stripe.com/docs/testing)