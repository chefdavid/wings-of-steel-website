import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripeService } from '../services/stripe';
import { useDonationGoals } from '../hooks/useDonationGoals';
import { useTeamRoster } from '../hooks/useTeamRoster';
import DonationProgressBar from './DonationProgressBar';
import { Loader, CreditCard, CheckCircle, Lock } from 'lucide-react';

interface DonorInfo {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  playerName: string;
  isAnonymous: boolean;
  message: string;
  isRecurring: boolean;
}

interface DonationFormProps {
  onSuccess?: () => void;
  initialAmount?: number;
  eventTag?: string;
  embedded?: boolean;
}

const PRESET_AMOUNTS = [5, 10, 25, 50, 100];

// Payment form component that uses Stripe hooks (must be inside Elements provider)
function PaymentForm({
  donorInfo,
  displayAmount,
  loading,
  setLoading,
  error,
  setError,
  setStep,
  onSuccess,
  embedded,
}: {
  donorInfo: DonorInfo;
  displayAmount: number;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string;
  setError: (error: string) => void;
  setStep: (step: 'info' | 'payment') => void;
  onSuccess: () => void;
  embedded?: boolean;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const handlePaymentSubmit = async (e: React.FormEvent) => {
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
          receipt_email: donorInfo.email,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment status in database (fallback if webhook is delayed)
        try {
          await fetch('/.netlify/functions/confirm-payment-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
          });
        } catch (confirmErr) {
          console.error('Status confirmation fallback error (non-critical):', confirmErr);
        }
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      setError('Payment processing failed. Please try again.');
      console.error('Payment error:', err);
      setLoading(false);
    }
  };

  const textColor = embedded ? 'text-gray-900' : 'text-white';
  const subtextColor = embedded ? 'text-gray-600' : 'text-ice-blue';
  const cardBg = embedded ? 'bg-gray-100' : 'bg-steel-blue/30';
  const cardBorder = embedded ? 'border-gray-300' : 'border-steel-blue';
  const paymentBg = embedded ? 'bg-white' : 'bg-dark-steel';
  const backBtnClass = embedded
    ? 'flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors border border-gray-300'
    : 'flex-1 bg-dark-steel text-white py-3 rounded-lg font-semibold hover:bg-steel-gray transition-colors border-2 border-steel-blue';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className={`text-2xl md:text-3xl font-sport ${textColor} mb-2`}>Payment Information</h3>
        <p className={`${subtextColor} text-base`}>
          Secure payment powered by Stripe. Your information is encrypted and secure.
        </p>
        <p className="text-yellow-400 font-semibold text-sm mt-2">
          <Lock className="w-3 h-3 inline mr-1" />
          Secure & Encrypted
        </p>
      </div>

      <div className={`${cardBg} rounded-lg p-4 border-2 ${cardBorder}`}>
        <div className="flex justify-between items-center mb-2">
          <span className={`${subtextColor} font-medium`}>Donation Amount</span>
          <span className="text-yellow-400 font-sport text-xl">${displayAmount.toFixed(2)}</span>
        </div>
        {donorInfo.isRecurring && (
          <div className={`text-xs ${subtextColor} mt-1`}>
            This will be charged monthly. You can cancel anytime.
          </div>
        )}
        {donorInfo.playerName && (
          <div className="text-xs text-yellow-400 mt-1 font-semibold">
            In honor of: {donorInfo.playerName}
          </div>
        )}
      </div>

      <div className={`${paymentBg} rounded-lg p-6 border-2 ${cardBorder}`}>
        <PaymentElement />
      </div>

      {error && (
        <div className="bg-red-600/20 border-2 border-red-500 rounded-lg p-4">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setStep('info')}
          className={backBtnClass}
        >
          Back
        </button>
        <button
          onClick={handlePaymentSubmit}
          disabled={loading || !stripe || !elements}
          className="flex-1 bg-yellow-400 text-black py-4 rounded-lg font-sport text-lg hover:bg-yellow-300 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Complete Donation - ${displayAmount.toFixed(2)}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

function DonationFormInner({ onSuccess, initialAmount, eventTag, embedded }: DonationFormProps & { stripePromise?: any }) {
  const { activeGoal } = useDonationGoals();

  // Try to get players, but don't fail if URLTeamProvider is not available
  let players: any[] = [];
  try {
    const roster = useTeamRoster();
    players = roster.players || [];
  } catch (error) {
    console.log('Player roster not available (URLTeamProvider not found), continuing without player dropdown');
  }

  const [stripePromise, setStripePromise] = useState<any>(null);
  const [amount, setAmount] = useState<number>(initialAmount || 25);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);
  const [success, setSuccess] = useState(false);

  // Update amount when initialAmount changes
  useEffect(() => {
    if (initialAmount) {
      setAmount(initialAmount);
      setIsCustom(false);
      setCustomAmount('');
    }
  }, [initialAmount]);

  useEffect(() => {
    stripeService.getStripe().then(stripe => {
      setStripePromise(stripe);
    });
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'info' | 'payment'>('info');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [donorInfo, setDonorInfo] = useState<DonorInfo>({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    playerName: '',
    isAnonymous: false,
    message: '',
    isRecurring: true,
  });
  const [playerSearch, setPlayerSearch] = useState('');
  const [showPlayerDropdown, setShowPlayerDropdown] = useState(false);

  // Filter players based on search
  const filteredPlayers = players.filter(player => {
    if (!playerSearch) return true;
    const searchLower = playerSearch.toLowerCase();
    const playerName = `${player.first_name || ''} ${player.last_name || ''}`.toLowerCase().trim();
    return playerName.includes(searchLower);
  });

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    setIsCustom(true);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setAmount(numValue);
    }
  };

  const handleDonorInfoChange = (field: keyof DonorInfo, value: string | boolean) => {
    setDonorInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleInfoNext = async () => {
    if (amount <= 0) {
      setError('Please select or enter a donation amount');
      return;
    }

    if (!donorInfo.name || !donorInfo.email) {
      setError('Please fill in your name and email');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(donorInfo.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);

    // Create payment intent before going to payment step
    try {
      const response = await fetch('/.netlify/functions/create-donation-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          donorInfo: {
            name: donorInfo.name,
            email: donorInfo.email,
            phone: donorInfo.phone || undefined,
            companyName: donorInfo.companyName || undefined,
            playerName: donorInfo.playerName || undefined,
            isAnonymous: donorInfo.isAnonymous,
            message: donorInfo.message || undefined,
          },
          donationType: donorInfo.isRecurring ? 'recurring' : 'one-time',
          isRecurring: donorInfo.isRecurring,
          campaignId: activeGoal?.goal_id || null,
          eventTag: eventTag || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      setClientSecret(data.clientSecret);
      setStep('payment');
    } catch (err: any) {
      console.error('Error creating payment intent:', err);
      setError(err.message || 'Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setSuccess(true);
    onSuccess?.();
  };

  const currentAmount = isCustom && customAmount ? parseFloat(customAmount) : amount;
  const displayAmount = currentAmount > 0 ? currentAmount : amount;

  // Embedded vs modal color scheme
  const textColor = embedded ? 'text-gray-900' : 'text-white';
  const subtextColor = embedded ? 'text-gray-600' : 'text-ice-blue';
  const inputBg = embedded ? 'bg-white' : 'bg-dark-steel';
  const inputBorder = embedded ? 'border-gray-300' : 'border-steel-blue';
  const inputText = embedded ? 'text-gray-900' : 'text-white';
  const inputPlaceholder = embedded ? 'placeholder-gray-400' : 'placeholder-gray-400';
  const focusBorder = 'focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50';
  const presetBase = embedded ? 'border-gray-300 bg-white text-gray-900 hover:border-yellow-400' : 'border-steel-blue bg-dark-steel text-white hover:border-yellow-400';
  const presetActive = 'border-yellow-400 bg-yellow-400/30 text-yellow-400';
  const checkboxBg = embedded ? 'bg-white border-gray-300' : 'bg-steel-gray/30 border-steel-blue';
  const dropdownBg = embedded ? 'bg-white border-gray-300' : 'bg-dark-steel border-steel-blue';
  const dropdownHover = embedded ? 'hover:bg-gray-100' : 'hover:bg-steel-blue/30';
  const dropdownText = embedded ? 'text-gray-900' : 'text-white';
  const dropdownDivider = embedded ? 'border-gray-200' : 'border-steel-blue/20';
  const errorBg = 'bg-red-600/20 border-2 border-red-500';

  if (success) {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        </motion.div>
        <h3 className={`text-2xl font-bold ${textColor} mb-2`}>Thank You!</h3>
        <p className={embedded ? 'text-gray-600' : 'text-gray-300'}>
          Your donation has been processed successfully. A receipt has been sent to your email.
        </p>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="text-center py-8">
        <Loader className="w-8 h-8 animate-spin mx-auto text-yellow-400" />
        <p className={`${embedded ? 'text-gray-600' : 'text-gray-300'} mt-4`}>Loading payment form...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      {!embedded && <DonationProgressBar mode="full" />}

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {['info', 'payment'].map((s, index) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step === s
                  ? 'bg-yellow-400 text-black'
                  : ['info', 'payment'].indexOf(step) > index
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-600 text-gray-300'
              }`}
            >
              {['info', 'payment'].indexOf(step) > index ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                index + 1
              )}
            </div>
            {index < 1 && (
              <div
                className={`w-12 h-1 ${
                  ['info', 'payment'].indexOf(step) > index
                    ? 'bg-green-500'
                    : 'bg-gray-600'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Donor Information Step (Combined with Amount Selection) */}
      {step === 'info' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="text-center mb-4">
            <h3 className={`text-2xl md:text-3xl font-sport ${textColor} mb-2`}>Make a Donation</h3>
            <p className={`${subtextColor} text-sm`}>
              100% goes directly to our players. Tax-deductible 501(c)(3).
            </p>
          </div>

          {/* Amount Selection */}
          <div className="grid grid-cols-5 gap-2">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                onClick={() => handleAmountSelect(preset)}
                className={`p-2 md:p-3 rounded-lg border-2 transition-all ${
                  amount === preset && !isCustom
                    ? presetActive
                    : presetBase
                }`}
              >
                <div className="text-lg md:text-xl font-bold">${preset}</div>
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="number"
              min="1"
              step="0.01"
              value={customAmount}
              onChange={(e) => handleCustomAmount(e.target.value)}
              placeholder="Custom amount"
              className={`flex-1 px-4 py-2 ${inputBg} border-2 ${inputBorder} rounded-lg ${inputText} ${inputPlaceholder} focus:outline-none ${focusBorder}`}
            />
            <label className={`flex items-center gap-2 text-sm ${subtextColor} whitespace-nowrap`}>
              <input
                type="checkbox"
                checked={donorInfo.isRecurring}
                onChange={(e) => handleDonorInfoChange('isRecurring', e.target.checked)}
                className={`w-5 h-5 text-yellow-400 ${checkboxBg} rounded`}
              />
              Monthly
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${subtextColor} mb-2`}>
                Name <span className="text-yellow-400">*</span>
              </label>
              <input
                type="text"
                required
                value={donorInfo.name}
                onChange={(e) => handleDonorInfoChange('name', e.target.value)}
                className={`w-full px-4 py-3 ${inputBg} border-2 ${inputBorder} rounded-lg ${inputText} ${inputPlaceholder} focus:outline-none ${focusBorder}`}
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${subtextColor} mb-2`}>
                Email <span className="text-yellow-400">*</span>
              </label>
              <input
                type="email"
                required
                value={donorInfo.email}
                onChange={(e) => handleDonorInfoChange('email', e.target.value)}
                className={`w-full px-4 py-3 ${inputBg} border-2 ${inputBorder} rounded-lg ${inputText} ${inputPlaceholder} focus:outline-none ${focusBorder}`}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${subtextColor} mb-2`}>
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={donorInfo.phone}
                onChange={(e) => handleDonorInfoChange('phone', e.target.value)}
                className={`w-full px-4 py-3 ${inputBg} border-2 ${inputBorder} rounded-lg ${inputText} ${inputPlaceholder} focus:outline-none ${focusBorder}`}
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${subtextColor} mb-2`}>
                Company Name (Optional)
              </label>
              <input
                type="text"
                value={donorInfo.companyName}
                onChange={(e) => handleDonorInfoChange('companyName', e.target.value)}
                className={`w-full px-4 py-3 ${inputBg} border-2 ${inputBorder} rounded-lg ${inputText} ${inputPlaceholder} focus:outline-none ${focusBorder}`}
                placeholder="Company name"
              />
            </div>
          </div>

          {/* Player Name Dropdown */}
          <div className="relative">
            <label className={`block text-sm font-medium ${subtextColor} mb-2`}>
              Honor a Player (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={playerSearch || donorInfo.playerName}
                onChange={(e) => {
                  setPlayerSearch(e.target.value);
                  handleDonorInfoChange('playerName', e.target.value);
                  setShowPlayerDropdown(true);
                }}
                onFocus={() => setShowPlayerDropdown(true)}
                className={`w-full px-4 py-3 ${inputBg} border-2 ${inputBorder} rounded-lg ${inputText} ${inputPlaceholder} focus:outline-none ${focusBorder}`}
                placeholder="Search for a player or type a name"
              />

              {showPlayerDropdown && filteredPlayers.length > 0 && (
                <div className={`absolute z-10 w-full mt-1 ${dropdownBg} border-2 rounded-lg shadow-xl max-h-60 overflow-y-auto`}>
                  {filteredPlayers.slice(0, 10).map((player) => {
                    const fullName = `${player.first_name || ''} ${player.last_name || ''}`.trim();
                    return (
                      <button
                        key={player.id}
                        type="button"
                        onClick={() => {
                          handleDonorInfoChange('playerName', fullName);
                          setPlayerSearch(fullName);
                          setShowPlayerDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 ${dropdownHover} ${dropdownText} text-sm border-b ${dropdownDivider} last:border-0 transition-colors`}
                      >
                        {fullName} {player.jersey_number ? `#${player.jersey_number}` : ''}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {donorInfo.playerName && (
              <p className={`text-xs ${subtextColor} mt-1`}>
                Donating in honor of: <span className="text-yellow-400 font-semibold">{donorInfo.playerName}</span>
              </p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium ${subtextColor} mb-2`}>
              Message (Optional)
            </label>
              <textarea
              value={donorInfo.message}
              onChange={(e) => handleDonorInfoChange('message', e.target.value)}
              rows={3}
              className={`w-full px-4 py-3 ${inputBg} border-2 ${inputBorder} rounded-lg ${inputText} ${inputPlaceholder} focus:outline-none ${focusBorder}`}
              placeholder="Leave an encouraging message for our players..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`anonymous-${embedded ? 'embedded' : 'modal'}`}
              checked={donorInfo.isAnonymous}
              onChange={(e) => handleDonorInfoChange('isAnonymous', e.target.checked)}
              className={`w-5 h-5 text-yellow-400 ${checkboxBg} rounded focus:ring-2 focus:ring-yellow-400/50 cursor-pointer`}
            />
            <label htmlFor={`anonymous-${embedded ? 'embedded' : 'modal'}`} className={`${subtextColor} text-sm cursor-pointer`}>
              Make this donation anonymous
            </label>
          </div>

          {error && (
            <div className={`${errorBg} rounded-lg p-4`}>
              <p className="text-red-300">{error}</p>
            </div>
          )}

          <button
            onClick={handleInfoNext}
            disabled={loading}
            className="w-full bg-yellow-400 text-black py-4 rounded-lg font-sport text-xl hover:bg-yellow-300 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin inline mr-2" />
                Processing...
              </>
            ) : (
              `Continue to Payment - $${displayAmount.toFixed(2)}${donorInfo.isRecurring ? '/mo' : ''}`
            )}
          </button>
          <p className={`text-center ${embedded ? 'text-gray-500' : 'text-gray-500'} text-xs mt-2 flex items-center justify-center gap-1`}>
            <Lock className="w-3 h-3" />
            Secure payment powered by Stripe
          </p>
        </motion.div>
      )}

      {/* Payment Step - Wrapped with Elements provider */}
      {step === 'payment' && clientSecret && stripePromise && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: embedded ? 'stripe' : 'night',
              variables: {
                colorPrimary: '#facc15',
                colorBackground: embedded ? '#ffffff' : '#1a1a2e',
                colorText: embedded ? '#111827' : '#ffffff',
                colorDanger: '#ef4444',
                fontFamily: 'Oswald, sans-serif',
                borderRadius: '8px',
              },
            },
          }}
        >
          <PaymentForm
            donorInfo={donorInfo}
            displayAmount={displayAmount}
            loading={loading}
            setLoading={setLoading}
            error={error}
            setError={setError}
            setStep={setStep}
            onSuccess={handleSuccess}
            embedded={embedded}
          />
        </Elements>
      )}

      {/* Loading state while creating payment intent */}
      {step === 'payment' && !clientSecret && (
        <div className="text-center py-8">
          <Loader className="w-8 h-8 animate-spin mx-auto text-yellow-400 mb-4" />
          <p className={embedded ? 'text-gray-600' : 'text-gray-300'}>Preparing your donation...</p>
        </div>
      )}
    </div>
  );
}

// Main export - self-contained with Stripe provider
const DonationFormComponent = ({ onSuccess, initialAmount, eventTag, embedded }: DonationFormProps) => {
  return (
    <DonationFormInner
      onSuccess={onSuccess}
      initialAmount={initialAmount}
      eventTag={eventTag}
      embedded={embedded}
    />
  );
};

export default DonationFormComponent;
