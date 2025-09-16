import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { stripeService } from '../services/stripe';
import {
  Pizza,
  Users,
  Calendar,
  MapPin,
  Clock,
  Phone,
  Mail,
  CreditCard,
  Trophy,
  Target,
  Heart,
  ChevronRight,
  Loader,
  Check,
  Zap,
  Star,
  Award,
  Gift,
  BarChart3
} from 'lucide-react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

interface LanePackage {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  maxPeople: number;
  popular?: boolean;
}

interface AddOn {
  id: string;
  name: string;
  price: number;
  description: string;
}

const lanePackages: LanePackage[] = [
  {
    id: 'standard',
    name: 'Lane Reservation',
    price: 15000, // $150 in cents
    description: 'Complete bowling package',
    features: [
      'Lane for up to 6 people',
      '1 Large pizza',
      '2 Pitchers of soda',
      '2 Hours of bowling',
      'Free shoe rental'
    ],
    maxPeople: 6
  }
];

const addOns: AddOn[] = [
  { id: 'raffle5', name: '50/50 Raffle Tickets (5)', price: 500, description: 'Support the team and win big!' },
  { id: 'raffle20', name: '50/50 Raffle Tickets (25)', price: 2000, description: 'Better odds with more tickets!' },
  { id: 'strike', name: 'Strike Challenge Entry', price: 1000, description: 'Enter to win prizes for strikes!' }
];

function CheckoutForm({ selectedPackage, selectedAddOns, customerInfo, onSuccess }: any) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          receipt_email: customerInfo.email,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment in database
        try {
          await fetch('/.netlify/functions/confirm-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentIntentId: paymentIntent.id })
          });
        } catch (confirmError) {
          console.error('Error confirming payment in database:', confirmError);
        }
        onSuccess(paymentIntent);
      }
    } catch (err) {
      setError('Payment processing failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const total = selectedPackage.price + selectedAddOns.reduce((sum: number, addon: AddOn) => sum + addon.price, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-steel-gray/20 backdrop-blur-sm rounded-lg p-6">
        <h3 className="text-2xl font-bebas text-ice-blue mb-4">Payment Information</h3>

        <div className="mb-6 p-4 bg-black/30 rounded">
          <p className="text-steel-gray text-sm mb-2">Order Summary:</p>
          <div className="text-white space-y-1">
            <p>{selectedPackage.name}: {stripeService.formatAmount(selectedPackage.price)}</p>
            {selectedAddOns.map((addon: AddOn) => (
              <p key={addon.id} className="text-sm text-steel-gray">
                + {addon.name}: {stripeService.formatAmount(addon.price)}
              </p>
            ))}
            <p className="font-bold pt-2 border-t border-steel-gray/30">
              Total: {stripeService.formatAmount(total)}
            </p>
          </div>
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
            <CreditCard className="w-5 h-5" />
            Complete Purchase - {stripeService.formatAmount(total)}
          </>
        )}
      </button>
    </form>
  );
}

export default function PizzaPinsAndPop() {
  const [selectedPackage, setSelectedPackage] = useState<LanePackage>(lanePackages[0]);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    teamMembers: '',
    specialRequests: ''
  });
  const [showCheckout, setShowCheckout] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [fundraisingGoal] = useState(10000);
  const [currentRaised, setCurrentRaised] = useState(4250);

  useEffect(() => {
    stripeService.getStripe().then(stripe => {
      setStripePromise(stripe);
    });
  }, []);

  const handleAddOnToggle = (addon: AddOn) => {
    setSelectedAddOns(prev => {
      const exists = prev.find(a => a.id === addon.id);
      if (exists) {
        return prev.filter(a => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const handleProceedToCheckout = async () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      alert('Please fill in all required fields');
      return;
    }

    const total = selectedPackage.price +
                  selectedAddOns.reduce((sum, addon) => sum + addon.price, 0) +
                  (donationAmount ? parseInt(donationAmount) * 100 : 0);

    try {
      // Use the dedicated Pizza Pins & Pop endpoint
      const response = await fetch('/.netlify/functions/pizza-pins-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          customerInfo: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
            company: customerInfo.company,
            teamMembers: customerInfo.teamMembers,
            specialRequests: customerInfo.specialRequests
          },
          packageName: selectedPackage.name,
          addons: selectedAddOns.map(a => ({ name: a.name, price: a.price })),
          donation: donationAmount ? parseInt(donationAmount) * 100 : 0
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();
      setClientSecret(clientSecret);
      setShowCheckout(true);
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      alert('Failed to initialize checkout. Please try again.');
    }
  };

  const handlePaymentSuccess = async (paymentIntent: any) => {
    // Calculate total amount
    const totalAmount = selectedPackage.price +
                       selectedAddOns.reduce((sum, addon) => sum + addon.price, 0) +
                       (donationAmount ? parseInt(donationAmount) * 100 : 0);

    // Send email notifications using Netlify
    try {
      await fetch('/.netlify/functions/send-emails-pizza-pins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerInfo: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
            company: customerInfo.company,
            teamMembers: customerInfo.teamMembers,
            specialRequests: customerInfo.specialRequests
          },
          packageName: selectedPackage.name,
          addons: selectedAddOns.map(a => ({ name: a.name, price: a.price })),
          donation: donationAmount ? parseInt(donationAmount) * 100 : 0,
          totalAmount: totalAmount,
          paymentIntentId: paymentIntent.id
        }),
      });
      console.log('Email notifications sent via Netlify');
    } catch (error) {
      console.error('Failed to send email notifications:', error);
      // Don't block the success flow if email fails
    }

    setOrderSuccess(true);
    setCurrentRaised(prev => prev + (selectedPackage.price + selectedAddOns.reduce((sum, addon) => sum + addon.price, 0)) / 100);
    setShowCheckout(false);
  };

  const progressPercentage = (currentRaised / fundraisingGoal) * 100;

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-steel to-black">
        <Navigation />
        <div className="py-20 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="bg-green-600/20 border border-green-600 rounded-lg p-8">
              <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-5xl font-bebas text-white mb-4">Registration Successful!</h2>
              <p className="text-green-400 text-lg mb-4">
                Thank you for supporting Wings of Steel Adult Team!
              </p>
              <p className="text-steel-gray">
                You will receive a confirmation email shortly with your lane details.
                See you at Laurel Lanes on October 26th!
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="mt-6 bg-steel-blue text-white px-6 py-3 rounded hover:bg-ice-blue transition-colors"
              >
                Return to Home
              </button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-steel to-black">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/Pizza, Pins &Pop.png.png')] bg-cover bg-center opacity-20"></div>

        {/* Animated Bowling Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -50, 100, 0],
              rotate: [0, 360, 720, 1080]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-10 left-10 text-yellow-500/20"
          >
            <span className="text-6xl">🎳</span>
          </motion.div>
          <motion.div
            animate={{
              x: [0, -100, 50, 0],
              y: [0, 50, -100, 0],
              rotate: [0, -360, -720, -1080]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 right-20 text-ice-blue/20"
          >
            <span className="text-8xl">🎯</span>
          </motion.div>
          <motion.div
            animate={{
              x: [0, 50, -100, 0],
              y: [0, 100, -50, 0],
              rotate: [0, 180, 360, 540]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-20 left-1/3 text-steel-blue/20"
          >
            <span className="text-7xl">🍕</span>
          </motion.div>
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-yellow-500 text-black px-4 py-1 rounded-full text-sm font-bold mb-4">
              4TH ANNUAL FUNDRAISER
            </span>
            <div className="flex items-center justify-center gap-4 mb-4">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl"
              >
                🎳
              </motion.span>
              <h1 className="text-7xl md:text-8xl font-bebas text-white">
                Pizza, Pins & Pop
              </h1>
              <motion.span
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="text-6xl"
              >
                🎳
              </motion.span>
            </div>
            <p className="text-2xl text-ice-blue mb-8 font-oswald">
              Supporting the Adult Wings of Steel Sled Hockey Team
            </p>

            <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-steel-gray/20 backdrop-blur-sm rounded-lg p-4 relative overflow-hidden"
              >
                <div className="absolute -top-2 -right-2 text-3xl opacity-10">📅</div>
                <Calendar className="w-8 h-8 text-ice-blue mx-auto mb-2" />
                <p className="text-white font-bold">Oct 26, 2024</p>
                <p className="text-steel-gray text-sm">Sunday Funday!</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-steel-gray/20 backdrop-blur-sm rounded-lg p-4 relative overflow-hidden"
              >
                <div className="absolute -top-2 -right-2 text-3xl opacity-10">⏰</div>
                <Clock className="w-8 h-8 text-ice-blue mx-auto mb-2" />
                <p className="text-white font-bold">12PM - 2PM</p>
                <p className="text-steel-gray text-sm">2 Hours of Fun</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-steel-gray/20 backdrop-blur-sm rounded-lg p-4 relative overflow-hidden"
              >
                <div className="absolute -top-2 -right-2 text-3xl opacity-10">📍</div>
                <MapPin className="w-8 h-8 text-ice-blue mx-auto mb-2" />
                <p className="text-white font-bold">Laurel Lanes</p>
                <p className="text-steel-gray text-sm">Maple Shade, NJ</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-steel-gray/20 backdrop-blur-sm rounded-lg p-4 relative overflow-hidden"
              >
                <div className="absolute -top-2 -right-2 text-3xl opacity-10">👥</div>
                <Users className="w-8 h-8 text-ice-blue mx-auto mb-2" />
                <p className="text-white font-bold">Up to 6 People</p>
                <p className="text-steel-gray text-sm">Per Lane</p>
              </motion.div>
            </div>

            {/* Fundraising Progress */}
            <div className="bg-steel-gray/20 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-xl font-bebas text-ice-blue mb-3">Fundraising Goal Progress</h3>
              <div className="relative h-8 bg-black/30 rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="absolute h-full bg-gradient-to-r from-steel-blue to-ice-blue"
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ice-blue font-bold">${currentRaised.toLocaleString()}</span>
                <span className="text-steel-gray">raised of ${fundraisingGoal.toLocaleString()} goal</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Registration Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bebas text-white text-center mb-12">
              Reserve Your Lane
            </h2>

            {!showCheckout ? (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Package Selection */}
                <div>
                  <h3 className="text-2xl font-bebas text-ice-blue mb-6">Event Package</h3>
                  <div className="bg-steel-blue/30 border-2 border-ice-blue rounded-lg p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-xl font-bebas text-white">{lanePackages[0].name}</h4>
                        <p className="text-steel-gray text-sm">{lanePackages[0].description}</p>
                      </div>
                      <span className="text-2xl font-bold text-ice-blue">
                        ${lanePackages[0].price / 100}
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {lanePackages[0].features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-steel-gray flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Add-ons */}
                  <h3 className="text-2xl font-bebas text-ice-blue mb-6 mt-8">Add-On Options</h3>
                  <div className="space-y-3">
                    {addOns.map((addon) => (
                      <label
                        key={addon.id}
                        className="flex items-start gap-3 p-4 bg-steel-gray/20 rounded-lg cursor-pointer hover:bg-steel-gray/30 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAddOns.some(a => a.id === addon.id)}
                          onChange={() => handleAddOnToggle(addon)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-white font-medium">{addon.name}</p>
                              <p className="text-steel-gray text-sm">{addon.description}</p>
                            </div>
                            <span className="text-ice-blue font-bold">+${addon.price / 100}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Additional Donation */}
                  <div className="mt-6 p-4 bg-steel-gray/20 rounded-lg">
                    <label className="block text-white mb-2">
                      Additional Donation (Optional)
                    </label>
                    <div className="flex gap-2">
                      <span className="text-steel-gray mt-2">$</span>
                      <input
                        type="number"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        placeholder="0"
                        min="0"
                        className="flex-1 bg-black/30 text-white p-2 rounded border border-steel-gray/30 focus:border-steel-blue outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h3 className="text-2xl font-bebas text-ice-blue mb-6">Your Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-steel-gray mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        required
                        className="w-full bg-black/30 text-white p-3 rounded border border-steel-gray/30 focus:border-steel-blue outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-steel-gray mb-2">Email *</label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                        required
                        className="w-full bg-black/30 text-white p-3 rounded border border-steel-gray/30 focus:border-steel-blue outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-steel-gray mb-2">Phone *</label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        required
                        className="w-full bg-black/30 text-white p-3 rounded border border-steel-gray/30 focus:border-steel-blue outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-steel-gray mb-2">Company/Organization (Optional)</label>
                      <input
                        type="text"
                        value={customerInfo.company}
                        onChange={(e) => setCustomerInfo({...customerInfo, company: e.target.value})}
                        className="w-full bg-black/30 text-white p-3 rounded border border-steel-gray/30 focus:border-steel-blue outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-steel-gray mb-2">Team Members (Names of bowlers)</label>
                      <textarea
                        value={customerInfo.teamMembers}
                        onChange={(e) => setCustomerInfo({...customerInfo, teamMembers: e.target.value})}
                        rows={3}
                        placeholder="List the names of people in your lane (up to 6)"
                        className="w-full bg-black/30 text-white p-3 rounded border border-steel-gray/30 focus:border-steel-blue outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-steel-gray mb-2">Special Requests</label>
                      <textarea
                        value={customerInfo.specialRequests}
                        onChange={(e) => setCustomerInfo({...customerInfo, specialRequests: e.target.value})}
                        rows={2}
                        placeholder="Any dietary restrictions or special needs?"
                        className="w-full bg-black/30 text-white p-3 rounded border border-steel-gray/30 focus:border-steel-blue outline-none"
                      />
                    </div>

                    {/* Order Summary */}
                    <div className="mt-8 p-6 bg-steel-gray/20 rounded-lg">
                      <h4 className="text-xl font-bebas text-white mb-4">Order Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-steel-gray">{selectedPackage.name}</span>
                          <span className="text-white">${selectedPackage.price / 100}</span>
                        </div>
                        {selectedAddOns.map((addon) => (
                          <div key={addon.id} className="flex justify-between">
                            <span className="text-steel-gray">{addon.name}</span>
                            <span className="text-white">${addon.price / 100}</span>
                          </div>
                        ))}
                        {donationAmount && (
                          <div className="flex justify-between">
                            <span className="text-steel-gray">Additional Donation</span>
                            <span className="text-white">${donationAmount}</span>
                          </div>
                        )}
                        <div className="pt-4 mt-4 border-t border-steel-gray/30 flex justify-between text-lg font-bold">
                          <span className="text-white">Total</span>
                          <span className="text-ice-blue">
                            ${(selectedPackage.price +
                               selectedAddOns.reduce((sum, addon) => sum + addon.price, 0)) / 100 +
                               (donationAmount ? parseInt(donationAmount) : 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleProceedToCheckout}
                      className="w-full bg-steel-blue text-white py-4 rounded font-oswald text-lg hover:bg-ice-blue transition-colors flex items-center justify-center gap-2"
                    >
                      Proceed to Payment
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                {clientSecret && stripePromise && (
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
                    <CheckoutForm
                      selectedPackage={selectedPackage}
                      selectedAddOns={selectedAddOns}
                      customerInfo={customerInfo}
                      onSuccess={handlePaymentSuccess}
                    />
                  </Elements>
                )}
                <button
                  onClick={() => setShowCheckout(false)}
                  className="mt-4 text-steel-gray hover:text-ice-blue text-sm"
                >
                  ← Back to packages
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-black/70 to-black/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <Star className="w-8 h-8 text-yellow-500" />
              <h2 className="text-5xl font-bebas text-white">Meet the Team You're Supporting</h2>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-xl text-steel-gray max-w-3xl mx-auto">
              The Wings of Steel adult team competes at the highest level of sled hockey,
              representing our community with pride and determination.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative rounded-lg overflow-hidden shadow-2xl mb-12"
          >
            <img
              src="/assets/101_1140 (1).jpg"
              alt="Wings of Steel Adult Team"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-3xl font-bebas mb-2">Wings of Steel Adult Sled Hockey Team</h3>
              <p className="text-lg text-ice-blue">Champions on and off the ice</p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-4 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-steel-gray/20 backdrop-blur-sm rounded-lg p-6 text-center"
            >
              <Trophy className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
              <p className="text-white font-bold">Multiple Championships</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-steel-gray/20 backdrop-blur-sm rounded-lg p-6 text-center"
            >
              <Users className="w-10 h-10 text-ice-blue mx-auto mb-3" />
              <p className="text-white font-bold">15+ Dedicated Athletes</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-steel-gray/20 backdrop-blur-sm rounded-lg p-6 text-center"
            >
              <Zap className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
              <p className="text-white font-bold">Elite Competition</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-steel-gray/20 backdrop-blur-sm rounded-lg p-6 text-center"
            >
              <Heart className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <p className="text-white font-bold">100% Heart & Hustle</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Support Section */}
      <section className="py-16 px-6 bg-black/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-4xl">🎳</span>
              <h2 className="text-5xl font-bebas text-white">Why Your Support Matters</h2>
              <span className="text-4xl">🎳</span>
            </div>
            <p className="text-xl text-steel-gray max-w-3xl mx-auto">
              Every dollar raised goes directly to supporting our adult sled hockey team's
              equipment, ice time, travel expenses, and tournament fees.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-steel-gray/20 backdrop-blur-sm rounded-lg p-6 text-center"
            >
              <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bebas text-white mb-2">Championship Team</h3>
              <p className="text-steel-gray">
                Support a team that represents our community with pride and determination
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-steel-gray/20 backdrop-blur-sm rounded-lg p-6 text-center"
            >
              <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bebas text-white mb-2">Community Impact</h3>
              <p className="text-steel-gray">
                Your contribution helps athletes with disabilities compete at the highest level
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-steel-gray/20 backdrop-blur-sm rounded-lg p-6 text-center"
            >
              <Target className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bebas text-white mb-2">100% Goes to Team</h3>
              <p className="text-steel-gray">
                Every penny directly supports our athletes and their hockey dreams
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-6 bg-black/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bebas text-white mb-8">Questions? Contact Us</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <a
              href="tel:856-220-7266"
              className="flex items-center justify-center gap-3 p-6 bg-steel-gray/20 rounded-lg hover:bg-steel-gray/30 transition-colors"
            >
              <Phone className="w-8 h-8 text-ice-blue" />
              <div className="text-left">
                <p className="text-white font-bold">Kathy Cursi</p>
                <p className="text-steel-gray">(856) 220-7266</p>
              </div>
            </a>
            <a
              href="mailto:pk3lps@comcast.net"
              className="flex items-center justify-center gap-3 p-6 bg-steel-gray/20 rounded-lg hover:bg-steel-gray/30 transition-colors"
            >
              <Mail className="w-8 h-8 text-ice-blue" />
              <div className="text-left">
                <p className="text-white font-bold">Email Us</p>
                <p className="text-steel-gray">pk3lps@comcast.net</p>
              </div>
            </a>
          </div>
          <div className="mt-8 p-6 bg-steel-gray/20 rounded-lg">
            <h3 className="text-2xl font-bebas text-ice-blue mb-4">Can't Make It? You Can Still Help!</h3>
            <p className="text-steel-gray mb-4">
              Unable to attend but want to support the team? Consider making a tax-deductible donation
              or becoming a virtual lane sponsor. Your name will be displayed at the event!
            </p>
            <button
              onClick={() => {
                setDonationAmount('100');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-steel-blue text-white px-6 py-3 rounded hover:bg-ice-blue transition-colors"
            >
              Make a Donation
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
