import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  MapPin,
  Phone,
  Clock,
  DollarSign,
  Users,
  Gift,
  Trophy,
  Minus,
  Plus,
  CreditCard,
  Loader,
  CheckCircle,
  Lock,
} from 'lucide-react'
import { FaGolfBall } from 'react-icons/fa'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { stripeService } from '../services/stripe'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'

type TeamChoice = 'youth' | 'adult' | null

/* ------------------------------------------------------------------ */
/*  Stripe Payment sub-form (rendered inside <Elements>)              */
/* ------------------------------------------------------------------ */
function PaymentForm({
  amount,
  email,
  onSuccess,
  onBack,
}: {
  amount: number
  email: string
  onSuccess: () => void
  onBack: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError('')

    try {
      const { error: stripeError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          confirmParams: { receipt_email: email },
          redirect: 'if_required',
        })

      if (stripeError) {
        setError(stripeError.message || 'Payment failed')
        setLoading(false)
        return
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess()
      }
    } catch {
      setError('Payment processing failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-dark-steel rounded-lg p-5 border-2 border-steel-blue">
        <PaymentElement />
      </div>

      {error && (
        <div className="bg-red-600/20 border border-red-500 rounded-lg p-3">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-dark-steel text-white py-3 rounded-lg font-semibold hover:bg-steel-gray transition-colors border-2 border-steel-blue"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading || !stripe || !elements}
          className="flex-1 bg-emerald-500 text-white py-3 rounded-lg font-sport text-lg hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay ${amount.toFixed(2)}
            </>
          )}
        </button>
      </div>
      <p className="text-center text-gray-400 text-xs mt-3 flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" />
        Secure payment powered by Stripe
      </p>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/*  Main page component                                                */
/* ------------------------------------------------------------------ */
const TopGolf = () => {
  const [selectedTeam, setSelectedTeam] = useState<TeamChoice>(null)
  const [quantity, setQuantity] = useState(1)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [formError, setFormError] = useState('')

  // Payment state
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [stripePromise, setStripePromise] = useState<any>(null)
  const [creatingPayment, setCreatingPayment] = useState(false)

  const PRICE_PER_PERSON = 20
  const totalAmount = quantity * PRICE_PER_PERSON

  useEffect(() => {
    stripeService.getStripe().then((s) => setStripePromise(s))
  }, [])

  const handleContinueToPayment = async () => {
    // Validate
    if (!selectedTeam) {
      setFormError('Please select which team you want to support')
      return
    }
    if (!firstName.trim() || !lastName.trim()) {
      setFormError('Please enter your first and last name')
      return
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Please enter a valid email address')
      return
    }

    setFormError('')
    setCreatingPayment(true)

    try {
      const response = await fetch(
        '/.netlify/functions/create-donation-payment',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalAmount,
            donorInfo: {
              name: `${firstName.trim()} ${lastName.trim()}`,
              email: email.trim(),
              phone: phone.trim() || undefined,
            },
            donationType: 'one-time',
            isRecurring: false,
            campaignId: null,
            eventTag: `topgolf-${selectedTeam}`,
          }),
        }
      )

      const text = await response.text()
      if (!text) {
        throw new Error('No response from payment server. Are you running netlify dev?')
      }

      let data
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(`Unexpected response from server: ${text.slice(0, 100)}`)
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment')
      }

      setClientSecret(data.clientSecret)
      setStep('payment')
    } catch (err: any) {
      setFormError(
        err.message || 'Failed to initialize payment. Please try again.'
      )
    } finally {
      setCreatingPayment(false)
    }
  }

  const handlePaymentSuccess = () => {
    setStep('success')
  }

  const handleBackToInfo = () => {
    setStep('info')
    setClientSecret(null)
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-white overflow-y-auto">
      <div className="min-h-screen bg-gradient-to-b from-dark-steel to-steel-gray">
        <Navigation />

        {/* Hero Section */}
        <section className="relative min-h-[80vh] lg:min-h-screen flex items-center justify-center overflow-hidden pt-20">
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src="/images/topgolf-hero.webp"
              alt="Topgolf driving range with hockey player"
              className="w-full h-full object-cover object-[30%_center] md:object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-dark-steel/40 via-dark-steel/25 to-dark-steel/80" />
          </div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-sport text-white tracking-wide leading-none mb-4">
                <span className="block text-5xl md:text-7xl lg:text-8xl">WINGS OF STEEL</span>
                <span className="block text-4xl md:text-5xl lg:text-6xl text-yellow-400 mt-2">TOPGOLF FUNDRAISER</span>
              </h1>
              <p className="text-xl md:text-2xl text-ice-blue font-display mb-2">
                Swing for a Cause — Support Sled Hockey
              </p>
              <p className="text-gray-300 text-lg mb-6">
                $20 per person &bull; Golf, Drinks & Fun
              </p>

              {/* Event Details Bar */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 md:p-6 max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-center space-x-2">
                  <Calendar className="text-emerald-400" size={24} />
                  <span className="text-white font-semibold">
                    March 8, 2026
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <MapPin className="text-emerald-400" size={24} />
                  <span className="text-white font-semibold">
                    Topgolf Mt. Laurel
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <DollarSign className="text-yellow-400" size={24} />
                  <span className="text-yellow-400 font-bold">
                    $20 / Person
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ============ REGISTRATION (directly below hero) ============ */}
        <section id="register" className="py-16 px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-sport text-white mb-2 tracking-wide text-center">
                REGISTER NOW
              </h2>
              <p className="text-ice-blue text-center mb-8">
                $20 per person — select your team and complete your registration
                below.
              </p>

              {/* Success state */}
              {step === 'success' && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-emerald-500/20 border-2 border-emerald-400 rounded-2xl p-10 text-center"
                >
                  <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-3xl font-sport text-white mb-2">
                    You're Registered!
                  </h3>
                  <p className="text-gray-300 mb-1">
                    A receipt has been sent to{' '}
                    <span className="text-emerald-400 font-semibold">
                      {email}
                    </span>
                    .
                  </p>
                  <p className="text-gray-400 text-sm">
                    {quantity} {quantity === 1 ? 'ticket' : 'tickets'} —{' '}
                    {selectedTeam === 'youth' ? 'Youth' : 'Adult'} Team — $
                    {totalAmount}
                  </p>
                </motion.div>
              )}

              {/* Info + Payment form */}
              {step !== 'success' && (
                <div className="bg-dark-steel/60 border border-steel-blue/30 rounded-2xl p-6 md:p-8 space-y-6">
                  {/* ---------- TEAM SELECTION ---------- */}
                  <div>
                    <label className="block text-sm font-medium text-ice-blue mb-3">
                      Which team are you supporting?{' '}
                      <span className="text-yellow-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        disabled={step === 'payment'}
                        onClick={() => setSelectedTeam('youth')}
                        className={`rounded-xl p-5 text-center transition-all duration-300 border-2 ${
                          selectedTeam === 'youth'
                            ? 'border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-400/20'
                            : 'border-steel-blue/30 bg-dark-steel/60 hover:border-emerald-400/50'
                        } ${step === 'payment' ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <div className="text-3xl mb-2">🏒</div>
                        <h3 className="text-lg font-sport text-white tracking-wide">
                          YOUTH
                        </h3>
                      </button>

                      <button
                        type="button"
                        disabled={step === 'payment'}
                        onClick={() => setSelectedTeam('adult')}
                        className={`rounded-xl p-5 text-center transition-all duration-300 border-2 ${
                          selectedTeam === 'adult'
                            ? 'border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-400/20'
                            : 'border-steel-blue/30 bg-dark-steel/60 hover:border-emerald-400/50'
                        } ${step === 'payment' ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <div className="text-3xl mb-2">🛷</div>
                        <h3 className="text-lg font-sport text-white tracking-wide">
                          ADULT
                        </h3>
                      </button>
                    </div>
                  </div>

                  {/* ---------- QUANTITY ---------- */}
                  <div>
                    <label className="block text-sm font-medium text-ice-blue mb-3">
                      Number of people
                    </label>
                    <div className="flex items-center justify-center gap-4">
                      <button
                        type="button"
                        disabled={quantity <= 1 || step === 'payment'}
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-10 h-10 rounded-full border-2 border-steel-blue bg-dark-steel text-white flex items-center justify-center hover:border-emerald-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="text-4xl font-sport text-white w-12 text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        disabled={quantity >= 20 || step === 'payment'}
                        onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                        className="w-10 h-10 rounded-full border-2 border-steel-blue bg-dark-steel text-white flex items-center justify-center hover:border-emerald-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <p className="text-gray-400 text-xs text-center mt-2">
                      ${PRICE_PER_PERSON} x {quantity} ={' '}
                      <span className="text-emerald-400 font-bold">
                        ${totalAmount}
                      </span>
                    </p>
                  </div>

                  {/* ---------- NAME, EMAIL, PHONE ---------- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ice-blue mb-1">
                        First Name <span className="text-yellow-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        disabled={step === 'payment'}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        className="w-full px-4 py-3 bg-dark-steel border-2 border-steel-blue rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ice-blue mb-1">
                        Last Name <span className="text-yellow-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        disabled={step === 'payment'}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        className="w-full px-4 py-3 bg-dark-steel border-2 border-steel-blue rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ice-blue mb-1">
                        Email <span className="text-yellow-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        disabled={step === 'payment'}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="w-full px-4 py-3 bg-dark-steel border-2 border-steel-blue rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ice-blue mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        disabled={step === 'payment'}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                        className="w-full px-4 py-3 bg-dark-steel border-2 border-steel-blue rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 disabled:opacity-60"
                      />
                    </div>
                  </div>

                  {/* ---------- SUMMARY BAR ---------- */}
                  <div className="bg-emerald-500/15 border border-emerald-400/30 rounded-lg px-4 py-3 flex items-center justify-between">
                    <div className="text-sm text-gray-300">
                      <span className="text-white font-semibold">
                        {quantity} {quantity === 1 ? 'ticket' : 'tickets'}
                      </span>
                      {selectedTeam && (
                        <>
                          {' — '}
                          <span className="text-emerald-400">
                            {selectedTeam === 'youth' ? 'Youth' : 'Adult'} Team
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-xl font-sport text-emerald-400">
                      ${totalAmount}
                    </div>
                  </div>

                  {/* ---------- ERROR ---------- */}
                  {formError && (
                    <div className="bg-red-600/20 border border-red-500 rounded-lg p-3">
                      <p className="text-red-300 text-sm">{formError}</p>
                    </div>
                  )}

                  {/* ---------- INFO STEP: Continue button ---------- */}
                  {step === 'info' && (
                    <>
                      <button
                        onClick={handleContinueToPayment}
                        disabled={creatingPayment}
                        className="w-full bg-emerald-500 text-white py-4 rounded-lg font-sport text-xl hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {creatingPayment ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            Preparing Payment...
                          </>
                        ) : (
                          <>
                            <CreditCard size={20} />
                            Continue to Payment — ${totalAmount}
                          </>
                        )}
                      </button>
                      <p className="text-center text-gray-400 text-xs mt-2 flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" />
                        Secure payment powered by Stripe
                      </p>
                    </>
                  )}

                  {/* ---------- PAYMENT STEP: Stripe Elements ---------- */}
                  {step === 'payment' && clientSecret && stripePromise && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Elements
                        stripe={stripePromise}
                        options={{ clientSecret }}
                      >
                        <PaymentForm
                          amount={totalAmount}
                          email={email}
                          onSuccess={handlePaymentSuccess}
                          onBack={handleBackToInfo}
                        />
                      </Elements>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Event Details */}
        <section id="details" className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-sport text-white mb-4 tracking-wide">
                EVENT DETAILS
              </h2>
              <div className="w-24 h-1 bg-emerald-400 mx-auto" />
            </motion.div>

            {/* Info cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-16">
              {[
                {
                  icon: <Calendar size={28} />,
                  title: 'Date',
                  value: 'March 8, 2026',
                  sub: 'Sunday',
                },
                {
                  icon: <Clock size={28} />,
                  title: 'Time',
                  value: '1 PM - 3 PM',
                  sub: 'Check-in at 12:30 PM',
                },
                {
                  icon: <MapPin size={28} />,
                  title: 'Location',
                  value: 'Topgolf',
                  sub: '104 Centerton Rd, Mt Laurel, NJ 08054',
                },
                {
                  icon: <Phone size={28} />,
                  title: 'Venue Phone',
                  value: '(856) 793-4086',
                  sub: 'Open until 11 PM',
                },
              ].map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-dark-steel/60 border border-emerald-500/20 rounded-xl p-6 text-center"
                >
                  <div className="text-emerald-400 mb-3 flex justify-center">
                    {item.icon}
                  </div>
                  <p className="text-emerald-400 text-sm uppercase tracking-wider font-sport mb-1">
                    {item.title}
                  </p>
                  <p className="text-white text-xl font-bold">{item.value}</p>
                  <p className="text-gray-400 text-sm mt-1">{item.sub}</p>
                </motion.div>
              ))}
            </div>

            {/* What's Included */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h3 className="text-3xl font-sport text-white mb-8 tracking-wide text-center">
                WHAT'S INCLUDED
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    icon: <FaGolfBall size={24} />,
                    title: 'Golf',
                    description:
                      "Hit balls at high-tech targets at Topgolf's state-of-the-art driving range bays. Fun for all skill levels!",
                  },
                  {
                    icon: <Gift size={24} />,
                    title: 'Unlimited Soda & Lemonade',
                    description:
                      'Stay refreshed with unlimited soft drinks and lemonade included with your registration.',
                  },
                  {
                    icon: <DollarSign size={24} />,
                    title: 'Food Available for Purchase',
                    description:
                      'Topgolf offers a full menu of appetizers, entrees, and more available for purchase at the venue.',
                  },
                  {
                    icon: <Users size={24} />,
                    title: 'Fun for Everyone',
                    description:
                      'No golf experience needed! Topgolf is designed for players of all ages and skill levels to have a great time.',
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="bg-dark-steel/40 border border-emerald-500/15 rounded-xl p-6 flex gap-4"
                  >
                    <div className="text-emerald-400 flex-shrink-0 mt-1">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg mb-1">
                        {item.title}
                      </h4>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Additional Activities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-emerald-500/10 via-emerald-400/20 to-emerald-500/10 border border-emerald-400/30 rounded-2xl p-8 md:p-10"
            >
              <h3 className="text-3xl font-sport text-white mb-6 tracking-wide text-center">
                EVEN MORE FUN
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Trophy
                    className="mx-auto text-yellow-400 mb-3"
                    size={36}
                  />
                  <h4 className="text-white font-bold text-lg mb-2">
                    Basket Raffle
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Win amazing prizes with our basket raffle! Tickets available
                    on-site.
                  </p>
                </div>
                <div className="text-center">
                  <DollarSign
                    className="mx-auto text-yellow-400 mb-3"
                    size={36}
                  />
                  <h4 className="text-white font-bold text-lg mb-2">
                    50/50 Raffle
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Enter for a chance to win half the pot! The other half
                    supports our athletes.
                  </p>
                </div>
                <div className="text-center">
                  <Gift
                    className="mx-auto text-yellow-400 mb-3"
                    size={36}
                  />
                  <h4 className="text-white font-bold text-lg mb-2">
                    Silent Auction
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Bid on exclusive items and experiences at our silent auction.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}

export default TopGolf
