import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripeService } from '../services/stripe';
import { useDonationGoals } from '../hooks/useDonationGoals';
import { useTeamRoster } from '../hooks/useTeamRoster';
import DonationProgressBar from './DonationProgressBar';
import { X, Loader, CreditCard, CheckCircle } from 'lucide-react';
import { FaHeart } from 'react-icons/fa';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialAmount?: number;
}

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

const PRESET_AMOUNTS = [5, 10, 25, 50, 100];

function DonationForm({ onSuccess, onClose, initialAmount }: { onSuccess: () => void; onClose: () => void; initialAmount?: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const { activeGoal } = useDonationGoals();
  
  // Try to get players, but don't fail if URLTeamProvider is not available
  let players: any[] = [];
  try {
    const roster = useTeamRoster();
    players = roster.players || [];
  } catch (error) {
    console.log('Player roster not available (URLTeamProvider not found), continuing without player dropdown');
  }
  
  const [amount, setAmount] = useState<number>(initialAmount || 25);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);
  
  // Update amount when initialAmount changes
  useEffect(() => {
    if (initialAmount) {
      setAmount(initialAmount);
      setIsCustom(false);
      setCustomAmount('');
    }
  }, [initialAmount]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'amount' | 'info' | 'payment'>('amount');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [donorInfo, setDonorInfo] = useState<DonorInfo>({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    playerName: '',
    isAnonymous: false,
    message: '',
    isRecurring: true, // Default to recurring to encourage monthly donations
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

  const selectedPlayer = players.find(p => 
    `${p.first_name || ''} ${p.last_name || ''}`.trim().toLowerCase() === donorInfo.playerName.toLowerCase()
  );

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

  const handleAmountNext = () => {
    if (amount <= 0) {
      setError('Please select or enter a donation amount');
      return;
    }
    setError('');
    setStep('info');
  };

  const handleInfoNext = () => {
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
    setStep('payment');
    createPaymentIntent();
  };

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      setError('');

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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      setClientSecret(data.clientSecret);
    } catch (err: any) {
      console.error('Error creating payment intent:', err);
      setError(err.message || 'Failed to initialize payment. Please try again.');
      setStep('info');
    } finally {
      setLoading(false);
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
        // Success! Show success message
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

  const currentAmount = isCustom && customAmount ? parseFloat(customAmount) : amount;
  const displayAmount = currentAmount > 0 ? currentAmount : amount;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <DonationProgressBar mode="full" />

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {['amount', 'info', 'payment'].map((s, index) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step === s
                  ? 'bg-yellow-400 text-black'
                  : ['amount', 'info', 'payment'].indexOf(step) > index
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-600 text-gray-300'
              }`}
            >
              {['amount', 'info', 'payment'].indexOf(step) > index ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                index + 1
              )}
            </div>
            {index < 2 && (
              <div
                className={`w-12 h-1 ${
                  ['amount', 'info', 'payment'].indexOf(step) > index
                    ? 'bg-green-500'
                    : 'bg-gray-600'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Amount Selection Step */}
      {step === 'amount' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl md:text-3xl font-sport text-white mb-2">Choose Your Donation Amount</h3>
            <p className="text-ice-blue text-base">
              Every donation helps us provide equipment, ice time, and support to our athletes.
            </p>
            <div className="mt-3 bg-steel-blue/20 border border-steel-blue rounded-lg p-3 inline-block">
              <p className="text-yellow-400 font-bold text-sm">
                💛 100% goes directly to our players • Monthly donations provide consistent support
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                onClick={() => handleAmountSelect(preset)}
                className={`p-3 md:p-4 rounded-lg border-2 transition-all transform active:scale-95 md:hover:scale-105 ${
                  amount === preset && !isCustom
                    ? 'border-yellow-400 bg-yellow-400/30 text-yellow-400 shadow-lg'
                    : 'border-steel-blue bg-dark-steel text-white hover:border-yellow-400 hover:bg-steel-blue/30'
                }`}
              >
                <div className="text-xl md:text-2xl font-bold">${preset}</div>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-ice-blue mb-2">
              Or enter a custom amount
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={customAmount}
              onChange={(e) => handleCustomAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-3 bg-dark-steel border-2 border-steel-blue rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50"
            />
          </div>

          {/* Recurring Donation Option - Prominent */}
          <div className={`border-2 rounded-lg p-4 transition-all ${
            donorInfo.isRecurring 
              ? 'bg-yellow-400/20 border-yellow-400 shadow-lg shadow-yellow-400/30' 
              : 'bg-steel-blue/20 border-steel-blue hover:border-yellow-400/50'
          }`}>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="recurring"
                checked={donorInfo.isRecurring}
                onChange={(e) => handleDonorInfoChange('isRecurring', e.target.checked)}
                className="w-6 h-6 text-yellow-400 bg-dark-steel border-2 border-steel-blue rounded focus:ring-2 focus:ring-yellow-400/50 cursor-pointer mt-0.5"
              />
              <div className="flex-1">
                <label htmlFor="recurring" className="cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-400 font-sport text-lg">💛</span>
                    <span className="text-white font-bold text-lg">Make this a monthly recurring donation</span>
                    <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded">RECOMMENDED</span>
                  </div>
                  <p className="text-ice-blue text-sm mb-2">
                    Provide consistent support throughout the season. You'll be charged <strong className="text-yellow-400">${displayAmount.toFixed(2)}</strong> each month.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-dark-steel/50 text-yellow-400 px-2 py-1 rounded">✓ Cancel anytime</span>
                    <span className="bg-dark-steel/50 text-yellow-400 px-2 py-1 rounded">✓ More impact</span>
                    <span className="bg-dark-steel/50 text-yellow-400 px-2 py-1 rounded">✓ Set & forget</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={handleAmountNext}
            className="w-full bg-yellow-400 text-black py-4 rounded-lg font-sport text-xl hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-lg"
          >
            Continue - ${displayAmount.toFixed(2)}
          </button>
        </motion.div>
      )}

      {/* Donor Information Step */}
      {step === 'info' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl md:text-3xl font-sport text-white mb-2">Your Information</h3>
            <p className="text-ice-blue text-base">
              We'll send you a receipt for your tax-deductible donation.
            </p>
            <p className="text-yellow-400 font-semibold text-sm mt-2">
              ✓ Tax-deductible 501(c)(3) nonprofit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ice-blue mb-2">
                Name <span className="text-yellow-400">*</span>
              </label>
              <input
                type="text"
                required
                value={donorInfo.name}
                onChange={(e) => handleDonorInfoChange('name', e.target.value)}
                className="w-full px-4 py-3 bg-dark-steel border-2 border-steel-blue rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ice-blue mb-2">
                Email <span className="text-yellow-400">*</span>
              </label>
              <input
                type="email"
                required
                value={donorInfo.email}
                onChange={(e) => handleDonorInfoChange('email', e.target.value)}
                className="w-full px-4 py-3 bg-dark-steel border-2 border-steel-blue rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ice-blue mb-2">
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={donorInfo.phone}
                onChange={(e) => handleDonorInfoChange('phone', e.target.value)}
                className="w-full px-4 py-3 bg-dark-steel border-2 border-steel-blue rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ice-blue mb-2">
                Company Name (Optional)
              </label>
              <input
                type="text"
                value={donorInfo.companyName}
                onChange={(e) => handleDonorInfoChange('companyName', e.target.value)}
                className="w-full px-4 py-3 bg-dark-steel border-2 border-steel-blue rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50"
                placeholder="Company name"
              />
            </div>
          </div>

          {/* Player Name Dropdown */}
          <div className="relative">
            <label className="block text-sm font-medium text-ice-blue mb-2">
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
                className="w-full px-4 py-3 bg-dark-steel border-2 border-steel-blue rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50"
                placeholder="Search for a player or type a name"
              />
              
              {showPlayerDropdown && filteredPlayers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-dark-steel border-2 border-steel-blue rounded-lg shadow-xl max-h-60 overflow-y-auto">
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
                        className="w-full text-left px-4 py-2 hover:bg-steel-blue/30 text-white text-sm border-b border-steel-blue/20 last:border-0 transition-colors"
                      >
                        {fullName} {player.jersey_number ? `#${player.jersey_number}` : ''}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {donorInfo.playerName && (
              <p className="text-xs text-ice-blue mt-1">
                Donating in honor of: <span className="text-yellow-400 font-semibold">{donorInfo.playerName}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-ice-blue mb-2">
              Message (Optional)
            </label>
              <textarea
              value={donorInfo.message}
              onChange={(e) => handleDonorInfoChange('message', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-dark-steel border-2 border-steel-blue rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50"
              placeholder="Leave an encouraging message for our players..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={donorInfo.isAnonymous}
              onChange={(e) => handleDonorInfoChange('isAnonymous', e.target.checked)}
              className="w-5 h-5 text-yellow-400 bg-steel-gray/30 border-2 border-steel-blue rounded focus:ring-2 focus:ring-yellow-400/50 cursor-pointer"
            />
            <label htmlFor="anonymous" className="text-ice-blue text-sm cursor-pointer">
              Make this donation anonymous
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('amount')}
              className="flex-1 bg-dark-steel text-white py-3 rounded-lg font-semibold hover:bg-steel-gray transition-colors border-2 border-steel-blue"
            >
              Back
            </button>
            <button
              onClick={handleInfoNext}
              disabled={loading}
              className="flex-1 bg-yellow-400 text-black py-3 rounded-lg font-sport text-lg hover:bg-yellow-300 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin inline mr-2" />
                  Processing...
                </>
              ) : (
                `Continue to Payment - $${displayAmount.toFixed(2)}`
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Payment Step */}
      {step === 'payment' && clientSecret && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl md:text-3xl font-sport text-white mb-2">Payment Information</h3>
            <p className="text-ice-blue text-base">
              Secure payment powered by Stripe. Your information is encrypted and secure.
            </p>
            <p className="text-yellow-400 font-semibold text-sm mt-2">
              🔒 Secure & Encrypted
            </p>
          </div>

          <div className="bg-steel-blue/30 rounded-lg p-4 border-2 border-steel-blue">
            <div className="flex justify-between items-center mb-2">
              <span className="text-ice-blue font-medium">Donation Amount</span>
              <span className="text-white font-sport text-xl text-yellow-400">${displayAmount.toFixed(2)}</span>
            </div>
            {donorInfo.isRecurring && (
              <div className="text-xs text-ice-blue mt-1">
                This will be charged monthly. You can cancel anytime.
              </div>
            )}
            {donorInfo.playerName && (
              <div className="text-xs text-yellow-400 mt-1 font-semibold">
                In honor of: {donorInfo.playerName}
              </div>
            )}
          </div>

          <div className="bg-dark-steel rounded-lg p-6 border-2 border-steel-blue">
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
              className="flex-1 bg-dark-steel text-white py-3 rounded-lg font-semibold hover:bg-steel-gray transition-colors border-2 border-steel-blue"
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
      )}

      {/* Loading state while creating payment intent */}
      {step === 'payment' && !clientSecret && loading && (
        <div className="text-center py-8">
          <Loader className="w-8 h-8 animate-spin mx-auto text-yellow-400 mb-4" />
          <p className="text-gray-300">Preparing your donation...</p>
        </div>
      )}
    </div>
  );
}

const DonationModal = ({ isOpen, onClose, onSuccess, initialAmount }: DonationModalProps) => {
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    stripeService.getStripe().then(stripe => {
      setStripePromise(stripe);
    });
  }, []);

  const handleSuccess = () => {
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onSuccess?.();
      onClose();
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 md:inset-auto md:right-0 md:top-0 md:bottom-0 w-full max-w-2xl bg-dark-steel shadow-2xl z-[10000] overflow-y-auto md:rounded-l-2xl border-l-2 border-steel-blue"
          >
            {/* Mobile: Full-screen header with progress */}
            <div className="sticky top-0 bg-gradient-to-b from-dark-steel to-dark-steel/95 backdrop-blur-sm border-b-2 border-steel-blue z-10">
              {/* Mobile: Enhanced header with progress bar */}
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl md:text-3xl font-sport text-white flex items-center gap-2 md:gap-3">
                    <FaHeart className="text-yellow-400 text-xl md:text-2xl" />
                    <span className="md:hidden">Donate</span>
                    <span className="hidden md:inline">Support Wings of Steel</span>
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors p-2 -mr-2"
                    aria-label="Close donation modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                {/* Mobile: Compact progress indicator */}
                <div className="md:hidden">
                  <DonationProgressBar mode="compact" showDetails={false} />
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 pb-20 md:pb-6">
              {success ? (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                  <p className="text-gray-300">
                    Your donation has been processed successfully. A receipt has been sent to your email.
                  </p>
                </div>
              ) : stripePromise ? (
                <Elements stripe={stripePromise}>
                  <DonationForm onSuccess={handleSuccess} onClose={onClose} initialAmount={initialAmount} />
                </Elements>
              ) : (
                <div className="text-center py-8">
                  <Loader className="w-8 h-8 animate-spin mx-auto text-yellow-400" />
                  <p className="text-gray-300 mt-4">Loading payment form...</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DonationModal;

