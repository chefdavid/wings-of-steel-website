import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, ShoppingCart, Check, CreditCard, Loader, Lock } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { stripeService } from '../../services/stripe'

interface Player {
  firstName: string
  lastName: string
  nickname: string
  email: string
  phone: string
  company: string
  shirtSize: string
  sendConfirmation: boolean
  isCaptain: boolean
}

interface GolfRegistrationFormProps {
  spotsRemaining: number
  setSpotsRemaining: (spots: number) => void
}

const createEmptyPlayer = (): Player => ({
  firstName: '',
  lastName: '',
  nickname: '',
  email: '',
  phone: '',
  company: '',
  shirtSize: 'L',
  sendConfirmation: false,
  isCaptain: false,
})

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
        // Confirm payment status in database (fallback if webhook is delayed)
        try {
          await fetch('/.netlify/functions/confirm-payment-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
          })
        } catch (confirmErr) {
          console.error('Status confirmation fallback error (non-critical):', confirmErr)
        }
        onSuccess()
      }
    } catch {
      setError('Payment processing failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white rounded-lg p-5 border-2 border-steel-blue">
        <PaymentElement />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-200 text-dark-steel py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors border-2 border-gray-300"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading || !stripe || !elements}
          className="flex-1 bg-yellow-500 text-dark-steel py-3 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay ${amount}
            </>
          )}
        </button>
      </div>
      <p className="text-center text-gray-500 text-xs mt-3 flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" />
        Secure payment powered by Stripe
      </p>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/*  Main registration form                                             */
/* ------------------------------------------------------------------ */
const GolfRegistrationForm: React.FC<GolfRegistrationFormProps> = ({
  spotsRemaining,
  setSpotsRemaining
}) => {
  const [numPlayers, setNumPlayers] = useState(4)
  const [players, setPlayers] = useState<Player[]>(
    Array(4).fill(null).map(() => createEmptyPlayer())
  )
  const [mulligans, setMulligans] = useState({
    player1: 0,
    player2: 0,
    player3: 0,
    player4: 0
  })
  const [addOns, setAddOns] = useState({
    dinnerGuests: 0,
  })
  const [golfingWith, setGolfingWith] = useState('')

  // Payment state
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [stripePromise, setStripePromise] = useState<any>(null)
  const [creatingPayment, setCreatingPayment] = useState(false)

  const [error, setError] = useState('')

  useEffect(() => {
    stripeService.getStripe().then((s) => setStripePromise(s))
  }, [])

  const PRICE_PER_GOLFER = 140

  const getCaptain = (): Player | null => {
    return players.slice(0, numPlayers).find(p => p.isCaptain) || null
  }

  const getTeamPrice = () => {
    return numPlayers * PRICE_PER_GOLFER
  }

  const calculateTotal = () => {
    let total = getTeamPrice()
    const totalMulligans = Object.values(mulligans).reduce((sum, count) => sum + count, 0)
    total += totalMulligans * 5
    total += addOns.dinnerGuests * 50
    return total
  }

  const handlePlayerChange = (index: number, field: keyof Player, value: any) => {
    const newPlayers = [...players]
    newPlayers[index] = { ...newPlayers[index], [field]: value }
    setPlayers(newPlayers)
  }

  const handleCaptainToggle = (index: number) => {
    const newPlayers = players.map((p, i) => ({
      ...p,
      isCaptain: i === index,
    }))
    setPlayers(newPlayers)
  }

  const handleMulliganChange = (player: string, delta: number) => {
    setMulligans(prev => {
      const current = prev[player as keyof typeof prev]
      const newValue = Math.max(0, current + delta)
      return { ...prev, [player]: newValue }
    })
  }

  const logFailedAttempt = async (errorMessage: string, errorType: string) => {
    try {
      const captain = getCaptain()
      const attemptData = {
        captain_info: captain ? {
          firstName: captain.firstName,
          lastName: captain.lastName,
          email: captain.email,
          phone: captain.phone,
          company: captain.company,
        } : null,
        players: players.slice(0, numPlayers),
        mulligans,
        add_ons: addOns,
        total_amount: calculateTotal(),
        is_early_bird: false,
        error_message: errorMessage,
        error_type: errorType,
        browser_info: navigator.userAgent
      }

      await supabase
        .from('golf_registration_attempts')
        .insert([attemptData])
    } catch (logError) {
      console.error('Failed to log registration attempt:', logError)
    }
  }

  const validateForm = (): boolean => {
    const captain = getCaptain()

    if (!captain) {
      setError('Please designate one golfer as the Team Captain')
      return false
    }

    for (let i = 0; i < numPlayers; i++) {
      if (!players[i].firstName || !players[i].lastName) {
        setError(`Please fill in first and last name for Golfer ${i + 1}`)
        return false
      }
    }

    if (!captain.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(captain.email)) {
      setError('Please enter a valid email address for the Team Captain')
      return false
    }

    if (!captain.phone) {
      setError('Please enter a phone number for the Team Captain')
      return false
    }

    return true
  }

  const handleContinueToPayment = async () => {
    setError('')

    if (!validateForm()) {
      return
    }

    const captain = getCaptain()!
    setCreatingPayment(true)

    try {
      const captainInfo = {
        firstName: captain.firstName,
        lastName: captain.lastName,
        email: captain.email,
        phone: captain.phone,
        company: captain.company,
        golfingWith: golfingWith || null,
      }

      const registrationData = {
        captain_info: captainInfo,
        players: players.slice(0, numPlayers),
        mulligans,
        add_ons: addOns,
        total_amount: calculateTotal(),
        is_early_bird: false,
        registration_date: new Date().toISOString()
      }

      const { error: dbError } = await supabase
        .from('golf_registrations')
        .insert([registrationData])
        .select()

      if (dbError) {
        await logFailedAttempt(dbError.message, 'database')
        throw dbError
      }

      const response = await fetch(
        '/.netlify/functions/create-donation-payment',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: calculateTotal(),
            donorInfo: {
              name: `${captain.firstName.trim()} ${captain.lastName.trim()}`,
              email: captain.email.trim(),
              phone: captain.phone.trim() || undefined,
              companyName: captain.company.trim() || undefined,
            },
            donationType: 'one-time',
            isRecurring: false,
            campaignId: null,
            eventTag: 'golf-outing',
          }),
        }
      )

      const text = await response.text()
      if (!text) {
        throw new Error('No response from payment server.')
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
      await logFailedAttempt(err.message || 'Unknown error', 'payment_init')
      setError(err.message || 'Failed to initialize payment. Please try again.')
    } finally {
      setCreatingPayment(false)
    }
  }

  const handlePaymentSuccess = async () => {
    const captain = getCaptain()

    try {
      const emailPromises = []

      if (captain?.email) {
        emailPromises.push(
          supabase.functions.invoke('send-golf-confirmation', {
            body: {
              to: captain.email,
              isCaptain: true
            }
          })
        )
      }

      players.slice(0, numPlayers).forEach((player) => {
        if (!player.isCaptain && player.sendConfirmation && player.email) {
          emailPromises.push(
            supabase.functions.invoke('send-golf-confirmation', {
              body: {
                to: player.email,
                playerName: `${player.firstName} ${player.lastName}`
              }
            })
          )
        }
      })

      await Promise.all(emailPromises)
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
    }

    setStep('success')
    setSpotsRemaining(spotsRemaining - 1)
  }

  const handleBackToInfo = () => {
    setStep('info')
    setClientSecret(null)
  }

  const captain = getCaptain()

  if (step === 'success') {
    return (
      <motion.div
        className="max-w-2xl mx-auto bg-green-50 border-2 border-green-500 rounded-lg p-5 md:p-8 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Check className="mx-auto text-green-500 mb-4" size={64} />
        <h3 className="text-3xl font-sport text-green-700 mb-4">Registration Complete!</h3>
        <p className="text-lg text-gray-700 mb-4">
          Thank you for registering for the Tom Brake Memorial Golf Outing!
        </p>
        <p className="text-gray-600">
          A confirmation email has been sent to <span className="font-semibold">{captain?.email}</span>.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Number of Players */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-4 md:p-8 mb-4 md:mb-6 border border-gray-100">
        <h3 className="text-xl md:text-2xl font-bold text-dark-steel mb-4 md:mb-6 text-center">Select Your Team Size</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          {[1, 2, 3, 4].map(num => (
            <motion.button
              key={num}
              type="button"
              onClick={() => setNumPlayers(num)}
              disabled={step === 'payment'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative p-3 md:p-6 rounded-xl font-bold transition-all border-2 ${
                numPlayers === num
                  ? 'bg-gradient-to-br from-steel-blue to-dark-steel text-white border-steel-blue shadow-xl'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-steel-blue'
              } ${step === 'payment' ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="text-2xl md:text-3xl mb-1 md:mb-2">{num === 1 ? '🏌️' : num === 2 ? '🏌️🏌️' : num === 3 ? '🏌️🏌️🏌️' : '🏌️🏌️🏌️🏌️'}</div>
              <div className="text-2xl font-sport mb-1">{num}</div>
              <div className="text-sm">{num === 1 ? 'Golfer' : 'Golfers'}</div>
              <div className={`text-xs mt-2 ${numPlayers === num ? 'text-ice-blue' : 'text-gray-500'}`}>
                ${num * PRICE_PER_GOLFER}
              </div>
              {numPlayers === num && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-championship-gold text-dark-steel rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ✓
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Pricing Display */}
        <div className="bg-white rounded-lg p-3 md:p-4 border-2 border-championship-gold">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Selected Package:</p>
              <p className="text-lg font-semibold text-dark-steel">
                {numPlayers} {numPlayers === 1 ? 'Golfer' : 'Golfers'} Registration
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-steel-blue">
                ${getTeamPrice()}
              </p>
              <p className="text-xs text-gray-500">
                ${PRICE_PER_GOLFER} per golfer
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs md:text-sm text-gray-600 mt-3 md:mt-4">
          <span className="font-semibold">Note:</span> Teams can have 1-4 players.
          We'll pair smaller groups with others to form complete foursomes.
        </p>
      </div>

      {/* Player Information */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-8 mb-4 md:mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-dark-steel mb-1 md:mb-2 text-center">Player Information</h3>
        <p className="text-xs md:text-sm text-gray-500 text-center mb-4 md:mb-6">One player must be designated as Team Captain</p>

        <AnimatePresence mode="wait">
          <div className="space-y-5 md:space-y-6">
            {Array.from({ length: numPlayers }).map((_, index) => {
              const isThisCaptain = players[index].isCaptain
              return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-lg p-4 md:p-6 border-2 transition-colors ${
                  isThisCaptain
                    ? 'bg-gradient-to-br from-championship-gold/10 to-yellow-50 border-championship-gold'
                    : 'bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:border-steel-blue'
                }`}
              >
                <div className={`absolute -top-3 left-4 px-3 py-1 rounded-full text-sm font-bold ${
                  isThisCaptain
                    ? 'bg-championship-gold text-dark-steel'
                    : 'bg-steel-blue text-white'
                }`}>
                  {isThisCaptain ? '⭐ Golfer ' + (index + 1) + ' — Captain' : 'Golfer ' + (index + 1)}
                </div>

                {/* Team Captain checkbox */}
                <div className="mt-2 mb-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={step === 'payment'}
                      checked={isThisCaptain}
                      onChange={() => handleCaptainToggle(index)}
                      className="w-4 h-4 text-championship-gold accent-yellow-500"
                    />
                    <span className={`text-sm font-semibold ${isThisCaptain ? 'text-championship-gold' : 'text-gray-600'}`}>
                      Team Captain
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <input
                    type="text"
                    placeholder="First Name*"
                    required
                    disabled={step === 'payment'}
                    value={players[index].firstName}
                    onChange={(e) => handlePlayerChange(index, 'firstName', e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-blue disabled:opacity-60"
                  />
                  <input
                    type="text"
                    placeholder="Last Name*"
                    required
                    disabled={step === 'payment'}
                    value={players[index].lastName}
                    onChange={(e) => handlePlayerChange(index, 'lastName', e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-blue disabled:opacity-60"
                  />
                  <input
                    type="text"
                    placeholder="Nickname (Optional)"
                    disabled={step === 'payment'}
                    value={players[index].nickname}
                    onChange={(e) => handlePlayerChange(index, 'nickname', e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-blue disabled:opacity-60"
                  />
                  <select
                    value={players[index].shirtSize}
                    disabled={step === 'payment'}
                    onChange={(e) => handlePlayerChange(index, 'shirtSize', e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-blue disabled:opacity-60"
                  >
                    <option value="S">Small</option>
                    <option value="M">Medium</option>
                    <option value="L">Large</option>
                    <option value="XL">X-Large</option>
                    <option value="2XL">2X-Large</option>
                    <option value="3XL">3X-Large</option>
                  </select>
                  <input
                    type="email"
                    placeholder={isThisCaptain ? 'Email*' : 'Email (Optional)'}
                    disabled={step === 'payment'}
                    value={players[index].email}
                    onChange={(e) => handlePlayerChange(index, 'email', e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-blue disabled:opacity-60"
                  />
                  {!isThisCaptain && (
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={players[index].sendConfirmation}
                        disabled={step === 'payment'}
                        onChange={(e) => handlePlayerChange(index, 'sendConfirmation', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span>Send confirmation to this player</span>
                    </label>
                  )}
                </div>

                {/* Captain-only fields: phone & company */}
                {isThisCaptain && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-3 md:mt-4"
                  >
                    <input
                      type="tel"
                      placeholder="Phone*"
                      disabled={step === 'payment'}
                      value={players[index].phone}
                      onChange={(e) => handlePlayerChange(index, 'phone', e.target.value)}
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-blue disabled:opacity-60"
                    />
                    <input
                      type="text"
                      placeholder="Company (Optional)"
                      disabled={step === 'payment'}
                      value={players[index].company}
                      onChange={(e) => handlePlayerChange(index, 'company', e.target.value)}
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-blue disabled:opacity-60"
                    />
                  </motion.div>
                )}

                {/* Mulligans for this player */}
                <div className="mt-3 flex items-center space-x-3 md:space-x-4">
                  <span className="font-semibold text-sm md:text-base">Mulligans ($5 each):</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      disabled={step === 'payment'}
                      onClick={() => handleMulliganChange(`player${index + 1}`, -1)}
                      className="bg-gray-300 hover:bg-gray-400 p-1 rounded disabled:opacity-50"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="font-bold text-xl w-8 text-center">
                      {mulligans[`player${index + 1}` as keyof typeof mulligans]}
                    </span>
                    <button
                      type="button"
                      disabled={step === 'payment'}
                      onClick={() => handleMulliganChange(`player${index + 1}`, 1)}
                      className="bg-gray-300 hover:bg-gray-400 p-1 rounded disabled:opacity-50"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )})}
          </div>
        </AnimatePresence>
      </div>

      {/* Who are you golfing with? */}
      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-4 md:mb-6">
        <h3 className="text-lg md:text-2xl font-bold text-dark-steel mb-1 md:mb-2">Who are you golfing with?</h3>
        <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
          If you're registering separately from your group, let us know who you'd like to be paired with.
        </p>
        <textarea
          placeholder="e.g. John Smith, Mike Johnson's group, etc."
          value={golfingWith}
          disabled={step === 'payment'}
          onChange={(e) => setGolfingWith(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-blue disabled:opacity-60 resize-none"
        />
      </div>

      {/* Add-Ons */}
      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-4 md:mb-6">
        <h3 className="text-lg md:text-2xl font-bold text-dark-steel mb-3 md:mb-4">Enhance Your Experience</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Extra Dinner Guests</h4>
              <p className="text-sm text-gray-600">$50 per guest</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                disabled={step === 'payment'}
                onClick={() => setAddOns({...addOns, dinnerGuests: Math.max(0, addOns.dinnerGuests - 1)})}
                className="bg-gray-300 hover:bg-gray-400 p-1 rounded disabled:opacity-50"
              >
                <Minus size={20} />
              </button>
              <span className="font-bold text-xl w-8 text-center">{addOns.dinnerGuests}</span>
              <button
                type="button"
                disabled={step === 'payment'}
                onClick={() => setAddOns({...addOns, dinnerGuests: addOns.dinnerGuests + 1})}
                className="bg-gray-300 hover:bg-gray-400 p-1 rounded disabled:opacity-50"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gradient-to-r from-steel-blue to-dark-steel text-white rounded-lg shadow-lg p-4 md:p-6 mb-4 md:mb-6">
        <h3 className="text-lg md:text-2xl font-bold mb-3 md:mb-4 flex items-center">
          <ShoppingCart className="mr-2" /> Order Summary
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>{numPlayers} Player{numPlayers > 1 ? 's' : ''} Registration</span>
            <span>${getTeamPrice()}</span>
          </div>
          {Object.values(mulligans).reduce((sum, count) => sum + count, 0) > 0 && (
            <div className="flex justify-between">
              <span>Mulligans ({Object.values(mulligans).reduce((sum, count) => sum + count, 0)} × $5)</span>
              <span>${Object.values(mulligans).reduce((sum, count) => sum + count, 0) * 5}</span>
            </div>
          )}
          {addOns.dinnerGuests > 0 && (
            <div className="flex justify-between">
              <span>Extra Dinner Guests ({addOns.dinnerGuests} × $50)</span>
              <span>${addOns.dinnerGuests * 50}</span>
            </div>
          )}
          <div className="border-t pt-2 mt-3 md:mt-4">
            <div className="flex justify-between text-xl md:text-2xl font-bold">
              <span>Total</span>
              <span>${calculateTotal()}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Info step: Continue to payment button */}
      {step === 'info' && (
        <>
          <button
            type="button"
            onClick={handleContinueToPayment}
            disabled={creatingPayment}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-dark-steel font-bold py-4 rounded-lg text-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            {creatingPayment ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Preparing Payment...
              </>
            ) : (
              <>
                <CreditCard size={20} />
                Continue to Payment — ${calculateTotal()}
              </>
            )}
          </button>
          <p className="text-center text-gray-500 text-xs mt-2 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            Secure payment powered by Stripe
          </p>
        </>
      )}

      {/* Payment step: Stripe Elements */}
      {step === 'payment' && clientSecret && stripePromise && captain && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Elements
            stripe={stripePromise}
            options={{ clientSecret }}
          >
            <PaymentForm
              amount={calculateTotal()}
              email={captain.email}
              onSuccess={handlePaymentSuccess}
              onBack={handleBackToInfo}
            />
          </Elements>
        </motion.div>
      )}
    </div>
  )
}

export default GolfRegistrationForm
