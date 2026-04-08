import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Loader, CreditCard, CheckCircle, Lock } from 'lucide-react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { stripeService } from '../../services/stripe'
import type { LucideIcon } from 'lucide-react'

interface SponsorshipItem {
  level: string
  price: string
  amount: number
  icon: LucideIcon
}

interface SponsorshipCheckoutModalProps {
  item: SponsorshipItem | null
  onClose: () => void
}

function PaymentForm({
  item,
  sponsorInfo,
  loading,
  setLoading,
  error,
  setError,
  onSuccess,
}: {
  item: SponsorshipItem
  sponsorInfo: { name: string; email: string; company: string }
  loading: boolean
  setLoading: (v: boolean) => void
  error: string
  setError: (v: string) => void
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError('')

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { receipt_email: sponsorInfo.email },
        redirect: 'if_required',
      })

      if (stripeError) {
        setError(stripeError.message || 'Payment failed')
        setLoading(false)
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        try {
          await fetch('/.netlify/functions/confirm-payment-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
          })
        } catch {}
        onSuccess()
      }
    } catch {
      setError('Payment processing failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-dark-steel rounded-lg p-6 border-2 border-steel-blue">
        <PaymentElement />
      </div>

      {error && (
        <div className="bg-red-600/20 border-2 border-red-500 rounded-lg p-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !stripe || !elements}
        className="w-full bg-yellow-400 text-black py-4 rounded-lg font-sport text-lg hover:bg-yellow-300 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Pay ${item.amount.toFixed(2)}
          </>
        )}
      </button>

      <p className="text-center text-gray-500 text-xs flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" />
        Secure payment powered by Stripe
      </p>
    </div>
  )
}

export default function SponsorshipCheckoutModal({ item, onClose }: SponsorshipCheckoutModalProps) {
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [stripePromise, setStripePromise] = useState<any>(null)
  const [sponsorInfo, setSponsorInfo] = useState({ name: '', email: '', company: '' })

  useEffect(() => {
    stripeService.getStripe().then(setStripePromise)
  }, [])

  // Reset state when item changes
  useEffect(() => {
    if (item) {
      setStep('info')
      setError('')
      setClientSecret(null)
      setSponsorInfo({ name: '', email: '', company: '' })
    }
  }, [item])

  if (!item) return null

  const Icon = item.icon

  const handleContinueToPayment = async () => {
    if (!sponsorInfo.name || !sponsorInfo.email) {
      setError('Please fill in your name and email')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sponsorInfo.email)) {
      setError('Please enter a valid email address')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await fetch('/.netlify/functions/create-donation-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: item.amount,
          donorInfo: {
            name: sponsorInfo.name,
            email: sponsorInfo.email,
            companyName: sponsorInfo.company || undefined,
          },
          donationType: 'one-time',
          isRecurring: false,
          eventTag: 'golf-outing',
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create payment')

      setClientSecret(data.clientSecret)
      setStep('payment')
    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-gradient-to-b from-steel-gray to-dark-steel rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-steel-blue/30">
            <h2 className="text-2xl font-sport text-white flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-ice-blue" />
              Sponsorship Checkout
            </h2>
            <button onClick={onClose} className="text-steel-gray hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Cart Item */}
            <div className="bg-dark-steel/80 rounded-xl p-4 mb-6 border border-steel-blue/30">
              <div className="flex items-center gap-4">
                <div className="bg-steel-blue/20 p-3 rounded-lg">
                  <Icon className="w-8 h-8 text-ice-blue" />
                </div>
                <div className="flex-1">
                  <h3 className="font-sport text-white text-lg">{item.level}</h3>
                  <p className="text-steel-gray text-sm">Golf Outing Sponsorship</p>
                </div>
                <div className="text-right">
                  <p className="text-ice-blue font-bold text-xl">{item.price}</p>
                  <p className="text-steel-gray text-xs">Qty: 1</p>
                </div>
              </div>
              <div className="border-t border-steel-blue/20 mt-4 pt-4 flex justify-between">
                <span className="text-white font-sport">Total</span>
                <span className="text-ice-blue font-bold text-xl">{item.price}</span>
              </div>
            </div>

            {step === 'success' ? (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                <p className="text-gray-300 mb-2">
                  Your <span className="text-ice-blue font-semibold">{item.level}</span> sponsorship has been confirmed.
                </p>
                <p className="text-gray-400 text-sm">A receipt has been sent to {sponsorInfo.email}.</p>
                <button
                  onClick={onClose}
                  className="mt-6 bg-steel-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-ice-blue transition-colors"
                >
                  Close
                </button>
              </div>
            ) : step === 'info' ? (
              <div className="space-y-4">
                <h3 className="text-lg font-sport text-white">Sponsor Information</h3>

                <div>
                  <label className="block text-sm font-medium text-ice-blue mb-1">
                    Name <span className="text-yellow-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={sponsorInfo.name}
                    onChange={(e) => setSponsorInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-steel border-2 border-steel-blue rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ice-blue mb-1">
                    Email <span className="text-yellow-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={sponsorInfo.email}
                    onChange={(e) => setSponsorInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-steel border-2 border-steel-blue rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ice-blue mb-1">
                    Company Name <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={sponsorInfo.company}
                    onChange={(e) => setSponsorInfo(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-steel border-2 border-steel-blue rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50"
                    placeholder="Company name for signage"
                  />
                </div>

                {error && (
                  <div className="bg-red-600/20 border-2 border-red-500 rounded-lg p-4">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleContinueToPayment}
                  disabled={loading}
                  className="w-full bg-yellow-400 text-black py-4 rounded-lg font-sport text-xl hover:bg-yellow-300 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Continue to Payment - ${item.price}`
                  )}
                </button>

                <p className="text-center text-gray-500 text-xs mt-1">
                  All sponsorships are tax-deductible - 501(c)(3)
                </p>
              </div>
            ) : step === 'payment' && clientSecret && stripePromise ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'night',
                    variables: {
                      colorPrimary: '#facc15',
                      colorBackground: '#1a1a2e',
                      colorText: '#ffffff',
                      colorDanger: '#ef4444',
                      fontFamily: 'Oswald, sans-serif',
                      borderRadius: '8px',
                    },
                  },
                }}
              >
                <PaymentForm
                  item={item}
                  sponsorInfo={sponsorInfo}
                  loading={loading}
                  setLoading={setLoading}
                  error={error}
                  setError={setError}
                  onSuccess={() => setStep('success')}
                />
              </Elements>
            ) : (
              <div className="text-center py-8">
                <Loader className="w-8 h-8 animate-spin mx-auto text-yellow-400 mb-4" />
                <p className="text-gray-300">Preparing payment...</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
