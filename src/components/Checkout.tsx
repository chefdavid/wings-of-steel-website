import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { printifyService } from '../services/printify';
import { stripeService } from '../services/stripe';
import type { Order, Address } from '../services/printify';
import { CreditCard, Lock, Loader } from 'lucide-react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { items, clearCart, getTotalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'shipping' | 'payment' | 'complete'>('shipping');
  
  const [formData, setFormData] = useState<Address>({
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
  });

  const subtotal = getTotalPrice();
  const { shipping, tax, total } = stripeService.calculateTotal(subtotal);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateShippingForm = () => {
    const required = ['first_name', 'last_name', 'email', 'phone', 'address1', 'city', 'region', 'zip'];
    for (const field of required) {
      if (!formData[field as keyof Address]) {
        setError(`Please fill in all required fields`);
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShippingForm()) {
      setPaymentStep('payment');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Confirm the payment
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          receipt_email: formData.email,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful, now create Printify order
        const order: Order = {
          address_to: formData,
          line_items: items.map(item => ({
            product_id: item.product.id,
            variant_id: item.variant.id,
            quantity: item.quantity,
          })),
          shipping_method: 1,
          send_shipping_notification: true,
          external_id: paymentIntent.id, // Link to Stripe payment
        };

        try {
          await printifyService.createOrder(order);
          setSuccess(true);
          clearCart();
          setPaymentStep('complete');
        } catch (orderError) {
          console.error('Failed to create Printify order:', orderError);
          setError('Payment succeeded but order creation failed. Please contact support with payment ID: ' + paymentIntent.id);
        }
      }
    } catch (err) {
      setError('Payment processing failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !success) {
    return (
      <div className="text-center">
        <h2 className="text-5xl font-bebas text-white mb-4">Checkout</h2>
        <p className="text-steel-gray text-lg">Your cart is empty</p>
        <a href="#store" className="inline-block mt-6 bg-steel-blue text-white px-6 py-3 rounded hover:bg-ice-blue transition-colors">
          Return to Store
        </a>
      </div>
    );
  }

  if (paymentStep === 'complete') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="bg-green-600/20 border border-green-600 rounded-lg p-8 mb-6">
          <h2 className="text-5xl font-bebas text-white mb-4">Order Successful!</h2>
          <p className="text-green-400 text-lg">
            Thank you for supporting Wings of Steel! Your order has been placed successfully.
          </p>
          <p className="text-steel-gray mt-4">
            You will receive an email confirmation shortly.
          </p>
          <a href="#store" className="inline-block mt-6 bg-steel-blue text-white px-6 py-3 rounded hover:bg-ice-blue transition-colors">
            Continue Shopping
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        {/* Progress Steps */}
        <div className="flex items-center mb-8">
          <div className={`flex items-center ${paymentStep !== 'shipping' ? 'text-green-500' : 'text-ice-blue'}`}>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
              paymentStep !== 'shipping' ? 'bg-green-500 border-green-500 text-white' : 'border-ice-blue'
            }`}>
              {paymentStep !== 'shipping' ? '✓' : '1'}
            </div>
            <span className="ml-2 font-oswald">Shipping</span>
          </div>
          <div className="flex-1 h-1 bg-steel-gray/30 mx-4"></div>
          <div className={`flex items-center ${paymentStep === 'payment' ? 'text-ice-blue' : 'text-steel-gray'}`}>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
              paymentStep === 'payment' ? 'border-ice-blue' : 'border-steel-gray'
            }`}>
              2
            </div>
            <span className="ml-2 font-oswald">Payment</span>
          </div>
        </div>

        {paymentStep === 'shipping' ? (
          <form onSubmit={handleShippingSubmit} className="space-y-6">
            <div className="bg-steel-gray/20 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-2xl font-bebas text-ice-blue mb-4">Shipping Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-steel-gray mb-2">First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
              className="w-full bg-steel-blue text-white py-4 rounded font-oswald text-lg hover:bg-ice-blue transition-colors"
            >
              Continue to Payment
            </button>
          </form>
        ) : (
          <form onSubmit={handlePaymentSubmit} className="space-y-6">
            <div className="bg-steel-gray/20 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-2xl font-bebas text-ice-blue mb-4">Payment Information</h3>
              
              <div className="mb-6 p-4 bg-black/30 rounded">
                <p className="text-steel-gray text-sm mb-2">Shipping to:</p>
                <p className="text-white">
                  {formData.first_name} {formData.last_name}<br />
                  {formData.address1}<br />
                  {formData.address2 && <>{formData.address2}<br /></>}
                  {formData.city}, {formData.region} {formData.zip}
                </p>
                <button
                  type="button"
                  onClick={() => setPaymentStep('shipping')}
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
        )}
      </div>

      <div>
        <div className="bg-steel-gray/20 backdrop-blur-sm rounded-lg p-6 sticky top-24">
          <h3 className="text-2xl font-bebas text-ice-blue mb-4">Order Summary</h3>
          
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.variant.id}`} className="flex justify-between text-sm">
                <span className="text-steel-gray">
                  {item.product.title} x {item.quantity}
                </span>
                <span className="text-white">
                  {printifyService.formatPrice(item.variant.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-steel-gray/30 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-steel-gray">Subtotal:</span>
              <span className="text-white">{stripeService.formatAmount(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-steel-gray">Shipping:</span>
              <span className="text-white">{stripeService.formatAmount(shipping)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-steel-gray">Tax:</span>
              <span className="text-white">{stripeService.formatAmount(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-steel-gray/30">
              <span className="text-white">Total:</span>
              <span className="text-ice-blue">{stripeService.formatAmount(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Checkout() {
  const { items, getTotalPrice } = useCart();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [stripePromise, setStripePromise] = useState<any>(null);

  useEffect(() => {
    // Load Stripe
    stripeService.getStripe().then(stripe => {
      setStripePromise(stripe);
    });
  }, []);

  useEffect(() => {
    // Only create payment intent if there are items in the cart
    if (items.length > 0) {
      const subtotal = getTotalPrice();
      const totals = stripeService.calculateTotal(subtotal);
      const total = totals.total;
      
      console.log('Checkout debug:', {
        itemsLength: items.length,
        subtotal,
        totals,
        total,
      });
      
      // Only create payment intent if total is greater than 0
      if (total > 0) {
        setLoading(true);
        console.log('Creating payment intent for amount:', total);
        stripeService.createPaymentIntent(total, {
          items: JSON.stringify(items.map(item => ({
            product_id: item.product.id,
            variant_id: item.variant.id,
            quantity: item.quantity,
            price: item.variant.price,
          }))),
        })
          .then(data => {
            console.log('Payment intent created:', data);
            setClientSecret(data.clientSecret);
            setLoading(false);
          })
          .catch(error => {
            console.error('Failed to create payment intent:', error);
            console.error('Error response:', error.response);
            console.error('Error details:', error.response?.data || error.message);
            if (error.response?.data) {
              console.error('Server error message:', error.response.data.error);
              console.error('Server error details:', error.response.data.details);
            }
            setLoading(false);
          });
      } else {
        console.log('Total is 0, not creating payment intent');
        setLoading(false);
      }
    } else {
      console.log('No items in cart');
      setLoading(false);
      setClientSecret(''); // Clear client secret when cart is empty
    }
  }, [items, getTotalPrice]);

  // Don't render checkout section if cart is empty
  if (items.length === 0) {
    return null;
  }

  return (
    <section id="checkout" className="py-20 px-6 bg-gradient-to-b from-dark-steel to-black min-h-screen">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-bebas text-white mb-8 text-center">Checkout</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-steel-blue border-t-transparent"></div>
            </div>
          ) : clientSecret && stripePromise ? (
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
                <CheckoutForm />
              </Elements>
          ) : items.length === 0 ? (
            <div className="text-center">
              <p className="text-steel-gray text-lg">Your cart is empty</p>
              <a href="#store" className="inline-block mt-6 bg-steel-blue text-white px-6 py-3 rounded hover:bg-ice-blue transition-colors">
                Return to Store
              </a>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-steel-gray text-lg">Preparing checkout...</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}