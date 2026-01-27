import type { Stripe } from '@stripe/stripe-js';
import axios from 'axios';

// Lazy load Stripe
let stripePromise: Promise<Stripe | null> | null = null;

const getStripePromise = async () => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    
    if (publishableKey) {
      const { loadStripe } = await import('@stripe/stripe-js');
      // loadStripe doesn't accept apiVersion - that's only for server-side SDK
      stripePromise = loadStripe(publishableKey);
    } else {
      stripePromise = Promise.resolve(null);
    }
  }
  return stripePromise;
};

export const stripeService = {
  getStripe: () => getStripePromise(),

  async createPaymentIntent(amount: number, metadata?: Record<string, any>) {
    try {
      const response = await axios.post('/.netlify/functions/create-payment-intent', {
        amount,
        currency: 'usd',
        metadata,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  formatAmount(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  },

  calculateShippingCost(): number {
    // Flat rate shipping in cents
    return 799; // $7.99
  },

  calculateTax(subtotal: number): number {
    // Simple tax calculation (8%)
    return Math.round(subtotal * 0.08);
  },

  calculateTotal(subtotal: number): {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  } {
    const shipping = this.calculateShippingCost();
    const tax = this.calculateTax(subtotal);
    const total = subtotal + shipping + tax;
    
    return {
      subtotal,
      shipping,
      tax,
      total,
    };
  },
};