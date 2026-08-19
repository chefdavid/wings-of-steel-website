import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useCart } from '../hooks/useCart';
import { printifyService } from '../services/printify';
import { stripeService } from '../services/stripe';
import type { Address } from '../services/printify';
import { CreditCard, Lock, Loader } from 'lucide-react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

type PaymentStep = 'shipping' | 'payment' | 'complete';

interface CheckoutTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  donation: number;
  feeCover: number;
  total: number;
}

const emptyAddress: Address = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  country: 'US',
  region: '',
  address1: '',
  address2: '',
  city: '',
  zip: '',
};

function ShippingForm({
  formData,
  onChange,
  onSubmit,
  error,
  submitting,
}: {
  formData: Address;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string;
  submitting: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="bg-steel-gray/20 backdrop-blur-sm rounded-lg p-6">
        <h3 className="text-2xl font-bebas text-ice-blue mb-4">
          Shipping Information
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-steel-gray mb-2">First Name *</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={onChange}
              required
              className="w-full bg-black/30 text-white p-3 rounded border border-steel-gray/30 focus:border-steel-blue outline-none"
            />
          </div>
          <div>
            <label className="block text-steel-gray mb-2">Last Name *</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={onChange}
              required
              className="w-full bg-black/30 text-white p-3 rounded border border-steel-gray/30 focus:border-steel-blue outline-none"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-steel-gray mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              required
              className="w-full bg-black/30 text-white p-3 rounded border border-steel-gray/30 focus:border-steel-blue outline-none"
            />
          </div>
          <div>
            <label className="block text-steel-gray mb-2">Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onChange}
              required
              className="w-full bg-black/30 text-white p-3 rounded border border-steel-gray/30 focus:border-steel-blue outline-none"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-steel-gray mb-2">Address Line 1 *</label>
          <input
            type="text"
            name="address1"
            value={formData.address1}
            onChange={onChange}
            required
            className="w-full bg-black/30 text-white p-3 rounded border border-steel-gray/30 focus:border-steel-blue outline-none"
          />
        </div>

        <div className="mt-4">
          <label className="block text-steel-gray mb-2">Address Line 2</label>
          <input
            type="text"
            name="address2"
            value={formData.address2}
            onChange={onChange}
            className="w-full bg-black/30 text-white p-3 rounded border border-steel-gray/30 focus:border-steel-blue outline-none"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-steel-gray mb-2">City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={onChange}
              required
              className="w-full bg-black/30 text-white p-3 rounded border border-steel-gray/30 focus:border-steel-blue outline-none"
            />
          </div>
          <div>
            <label className="block text-steel-gray mb-2">State *</label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={onChange}
              required
              placeholder="e.g., MA"
              className="w-full bg-black/30 text-white p-3 rounded border border-steel-gray/30 focus:border-steel-blue outline-none"
            />
          </div>
          <div>
            <label className="block text-steel-gray mb-2">ZIP Code *</label>
            <input
              type="text"
              name="zip"
              value={formData.zip}
              onChange={onChange}
              required
              className="w-full bg-black/30 text-white p-3 rounded border border-steel-gray/30 focus:border-steel-blue outline-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-600/20 border border-red-600 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-steel-blue text-white py-4 rounded font-oswald text-lg hover:bg-ice-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Preparing checkout...
          </>
        ) : (
          'Continue to Payment'
        )}
      </button>
      <div className="flex items-center justify-center gap-2 text-steel-gray text-sm mt-2">
        <Lock className="w-4 h-4" />
        <span>Secure checkout powered by Stripe</span>
      </div>
    </form>
  );
}

function PaymentForm({
  formData,
  total,
  onBack,
  onSuccess,
}: {
  formData: Address;
  total: number;
  onBack: () => void;
  onSuccess: (paymentIntentId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment(
        {
          elements,
          confirmParams: { receipt_email: formData.email },
          redirect: 'if_required',
        },
      );

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      setError('Payment processing failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-steel-gray/20 backdrop-blur-sm rounded-lg p-6">
        <h3 className="text-2xl font-bebas text-ice-blue mb-4">
          Payment Information
        </h3>

        <div className="mb-6 p-4 bg-black/30 rounded">
          <p className="text-steel-gray text-sm mb-2">Shipping to:</p>
          <p className="text-white">
            {formData.first_name} {formData.last_name}
            <br />
            {formData.address1}
            <br />
            {formData.address2 && (
              <>
                {formData.address2}
                <br />
              </>
            )}
            {formData.city}, {formData.region} {formData.zip}
          </p>
          <button
            type="button"
            onClick={onBack}
            className="text-steel-blue hover:text-ice-blue text-sm mt-2"
          >
            Edit shipping info
          </button>
        </div>

        <PaymentElement />
      </div>

      {error && (
        <div className="bg-red-600/20 border border-red-600 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !stripe || !elements}
        className="w-full bg-steel-blue text-white py-4 rounded font-oswald text-lg hover:bg-ice-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Pay {stripeService.formatAmount(total)}
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-steel-gray text-sm">
        <CreditCard className="w-4 h-4" />
        <span>Secure payment powered by Stripe</span>
      </div>
    </form>
  );
}

function OrderSummary({
  totals,
  itemSummaries,
}: {
  totals: CheckoutTotals;
  itemSummaries: { id: string; label: string; amount: number }[];
}) {
  return (
    <div className="bg-steel-gray/20 backdrop-blur-sm rounded-lg p-6 sticky top-24">
      <h3 className="text-2xl font-bebas text-ice-blue mb-4">Order Summary</h3>

      <div className="space-y-3 mb-4">
        {itemSummaries.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-steel-gray">{item.label}</span>
            <span className="text-white">
              {printifyService.formatPrice(item.amount)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-steel-gray/30 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-steel-gray">Subtotal:</span>
          <span className="text-white">
            {stripeService.formatAmount(totals.subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-steel-gray">Shipping:</span>
          <span className="text-white">
            {stripeService.formatAmount(totals.shipping)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-steel-gray">Tax:</span>
          <span className="text-white">
            {stripeService.formatAmount(totals.tax)}
          </span>
        </div>
        {totals.donation > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-steel-gray">Added donation:</span>
            <span className="text-white">
              {stripeService.formatAmount(totals.donation)}
            </span>
          </div>
        )}
        {totals.feeCover > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-steel-gray">Cover processing fee:</span>
            <span className="text-white">
              {stripeService.formatAmount(totals.feeCover)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold pt-2 border-t border-steel-gray/30">
          <span className="text-white">Total:</span>
          <span className="text-ice-blue">
            {stripeService.formatAmount(totals.total)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function Checkout() {
  const { items, clearCart, getTotalPrice } = useCart();
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('shipping');
  const [formData, setFormData] = useState<Address>(emptyAddress);
  const [clientSecret, setClientSecret] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [shippingError, setShippingError] = useState('');

  // TODO(donation-upsell): pull these from cart context once the donation upsell
  // and "cover processing fee" toggles ship.
  const donationCents = 0;
  const feeCoverCents = 0;

  useEffect(() => {
    stripeService.getStripe().then((stripe) => setStripePromise(stripe));
  }, []);

  const totals: CheckoutTotals = useMemo(() => {
    const subtotal = getTotalPrice();
    const base = stripeService.calculateTotal(subtotal);
    return {
      subtotal: base.subtotal,
      shipping: base.shipping,
      tax: base.tax,
      donation: donationCents,
      feeCover: feeCoverCents,
      total: base.total + donationCents + feeCoverCents,
    };
  }, [getTotalPrice, donationCents, feeCoverCents]);

  const itemSummaries = useMemo(
    () =>
      items.map((item) => ({
        id: `${item.product.id}-${item.variant.id}`,
        label: `${item.product.title} × ${item.quantity}`,
        amount: item.variant.price * item.quantity,
      })),
    [items],
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const requiredFields: (keyof Address)[] = [
      'first_name',
      'last_name',
      'email',
      'phone',
      'address1',
      'city',
      'region',
      'zip',
    ];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setShippingError('Please fill in all required fields');
        return;
      }
    }
    setShippingError('');

    if (totals.total <= 0) {
      setShippingError('Cart total is zero');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await axios.post(
        '/.netlify/functions/create-store-payment',
        {
          address: formData,
          line_items: items.map((item) => ({
            product_id: item.product.id,
            variant_id: item.variant.id,
            quantity: item.quantity,
            price: item.variant.price,
            title: item.product.title,
            variant_title: item.variant.title,
          })),
          subtotal_cents: totals.subtotal,
          shipping_cents: totals.shipping,
          tax_cents: totals.tax,
          donation_amount_cents: totals.donation,
          fee_cover_cents: totals.feeCover,
        },
      );
      setClientSecret(data.clientSecret);
      setPaymentStep('payment');
    } catch (err) {
      const detail =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : 'Could not start checkout. Please try again.';
      setShippingError(detail);
      console.error('create-store-payment failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = (_paymentIntentId: string) => {
    clearCart();
    setPaymentStep('complete');
  };

  if (items.length === 0 && paymentStep !== 'complete') {
    return null;
  }

  return (
    <section
      id="checkout"
      className="py-20 px-6 bg-gradient-to-b from-dark-steel to-black min-h-screen"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-bebas text-white mb-8 text-center">
            Checkout
          </h2>

          {paymentStep === 'complete' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="bg-green-600/20 border border-green-600 rounded-lg p-8 mb-6 max-w-xl mx-auto">
                <h2 className="text-5xl font-bebas text-white mb-4">
                  Order Successful!
                </h2>
                <p className="text-green-400 text-lg">
                  Thank you for supporting Wings of Steel — every purchase
                  funds access to the ice.
                </p>
                <p className="text-steel-gray mt-4">
                  You'll receive a Stripe receipt by email. Your gear ships
                  from Printify in 5–7 business days.
                </p>
                <a
                  href="#store"
                  className="inline-block mt-6 bg-steel-blue text-white px-6 py-3 rounded hover:bg-ice-blue transition-colors"
                >
                  Continue Shopping
                </a>
              </div>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center mb-8">
                  <div
                    className={`flex items-center ${
                      paymentStep !== 'shipping'
                        ? 'text-green-500'
                        : 'text-ice-blue'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                        paymentStep !== 'shipping'
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-ice-blue'
                      }`}
                    >
                      {paymentStep !== 'shipping' ? '✓' : '1'}
                    </div>
                    <span className="ml-2 font-oswald">Shipping</span>
                  </div>
                  <div className="flex-1 h-1 bg-steel-gray/30 mx-4"></div>
                  <div
                    className={`flex items-center ${
                      paymentStep === 'payment'
                        ? 'text-ice-blue'
                        : 'text-steel-gray'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                        paymentStep === 'payment'
                          ? 'border-ice-blue'
                          : 'border-steel-gray'
                      }`}
                    >
                      2
                    </div>
                    <span className="ml-2 font-oswald">Payment</span>
                  </div>
                </div>

                {paymentStep === 'shipping' && (
                  <ShippingForm
                    formData={formData}
                    onChange={handleInputChange}
                    onSubmit={handleShippingSubmit}
                    error={shippingError}
                    submitting={submitting}
                  />
                )}

                {paymentStep === 'payment' &&
                  clientSecret &&
                  stripePromise && (
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: 'night',
                          variables: {
                            colorPrimary: '#3B82F6',
                            colorBackground: '#1a1a1a',
                            colorText: '#ffffff',
                            colorDanger: '#ef4444',
                            fontFamily: 'Oswald, sans-serif',
                            borderRadius: '4px',
                          },
                        },
                      }}
                    >
                      <PaymentForm
                        formData={formData}
                        total={totals.total}
                        onBack={() => setPaymentStep('shipping')}
                        onSuccess={handlePaymentSuccess}
                      />
                    </Elements>
                  )}
              </div>

              <div>
                <OrderSummary totals={totals} itemSummaries={itemSummaries} />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
