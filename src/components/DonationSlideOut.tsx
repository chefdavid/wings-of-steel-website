import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaTimes, FaShoppingCart } from 'react-icons/fa';
import DonationProgressBar from './DonationProgressBar';
import MobileDonationBanner from './MobileDonationBanner';
import { useDonationGoals } from '../hooks/useDonationGoals';
import { useDonationModal } from '../contexts/DonationModalContext';

const PRESET_AMOUNTS = [5, 10, 25, 50, 100];

const DonationSlideOut = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const { activeGoal } = useDonationGoals();
  const { openModal } = useDonationModal();

  if (!activeGoal) {
    return null; // Don't show if no active goal
  }

  const percentage = activeGoal.percentage_complete || 0;
  const visibleHeight = '75vh'; // 75% of viewport height

  return (
    <>
      {/* Desktop: Slide-out panel (hidden on mobile) */}
      <motion.div
        className="hidden md:block fixed right-0 top-[12.5vh] z-40"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ height: visibleHeight }}
      >
        {/* Mini Cart Style Panel */}
        <motion.div
          initial={false}
          animate={{
            x: isHovered ? 0 : 'calc(100% - 60px)',
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="h-full bg-dark-steel border-l-2 border-t-2 border-b-2 border-steel-blue rounded-l-xl shadow-2xl overflow-hidden flex flex-col"
          style={{ minHeight: visibleHeight }}
        >
          <div className="flex flex-1 overflow-hidden">
            {/* Content area - Mini Cart Style */}
            <div className="w-80 md:w-96 p-6 flex flex-col overflow-y-auto">
              {/* Cart Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-steel-blue">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-400 p-2 rounded-lg">
                    <FaShoppingCart className="text-dark-steel text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-sport text-white">Donation Cart</h3>
                    <p className="text-xs text-ice-blue">Support Wings of Steel</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsHovered(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                  aria-label="Close donation panel"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Bar - Cart Item Style */}
              <div className="mb-6">
                <div className="bg-steel-blue/20 rounded-lg p-4 border border-steel-blue mb-3">
                  <DonationProgressBar mode="compact" showDetails={true} />
                </div>
              </div>

              {/* Impact Summary - Cart Summary Style */}
              <div className="bg-steel-blue/10 rounded-lg p-4 mb-4 border border-steel-blue">
                <div className="flex items-center gap-2 mb-2">
                  <FaHeart className="text-yellow-400" />
                  <span className="text-white font-semibold">Your Impact</span>
                </div>
                <p className="text-ice-blue text-sm">
                  <span className="text-yellow-400 font-bold">100%</span> of donations go directly to our players.
                </p>
              </div>

              {/* Quick Select Amounts */}
              <div className="mb-4">
                <p className="text-white font-semibold text-sm mb-3">Quick Select Amount</p>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setSelectedAmount(amount)}
                      className={`p-3 rounded-lg border-2 transition-all transform hover:scale-105 ${
                        selectedAmount === amount
                          ? 'border-yellow-400 bg-yellow-400/30 text-yellow-400 shadow-lg'
                          : 'border-steel-blue bg-dark-steel text-white hover:border-yellow-400 hover:bg-steel-blue/30'
                      }`}
                    >
                      <div className="text-lg font-bold">${amount}</div>
                    </button>
                  ))}
                </div>
                {selectedAmount && (
                  <div className="mt-3 bg-yellow-400/20 border border-yellow-400 rounded-lg p-2 text-center">
                    <p className="text-yellow-400 text-sm font-semibold">
                      Selected: ${selectedAmount}
                    </p>
                  </div>
                )}
              </div>

              {/* Monthly Donation Badge - Cart Badge Style */}
              <div className="bg-yellow-400/20 border-2 border-yellow-400 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-400 text-lg">⭐</span>
                  <span className="text-yellow-400 font-bold text-sm">RECOMMENDED</span>
                </div>
                <p className="text-white text-sm font-medium mb-2">
                  Monthly donations provide consistent support
                </p>
                <div className="flex gap-2 text-xs">
                  <span className="bg-dark-steel text-yellow-400 px-2 py-1 rounded">✓ Cancel anytime</span>
                  <span className="bg-dark-steel text-yellow-400 px-2 py-1 rounded">✓ More impact</span>
                </div>
              </div>

              {/* Checkout Button - Cart Style */}
              <div className="mt-auto pt-4 border-t-2 border-steel-blue">
                <button
                  onClick={() => {
                    openModal(selectedAmount || undefined);
                    setIsHovered(false);
                  }}
                  className="w-full bg-yellow-400 text-black py-4 rounded-lg font-sport text-lg hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                  <FaHeart />
                  <span>
                    {selectedAmount ? `Donate $${selectedAmount}` : 'Proceed to Donate'}
                  </span>
                </button>
                <p className="text-center text-ice-blue text-xs mt-2">
                  Secure checkout powered by Stripe
                </p>
              </div>
            </div>

            {/* Always visible tab - 60% height */}
            <div 
              className="flex flex-col items-center justify-center bg-yellow-400 text-black px-3 py-8 cursor-pointer min-w-[60px] border-l-2 border-steel-blue hover:bg-yellow-300 transition-colors"
              onClick={() => openModal(selectedAmount || undefined)}
            >
              <FaShoppingCart className="text-2xl mb-3" />
              <div className="text-[11px] font-bold leading-tight text-center whitespace-nowrap mb-3" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
                DONATE
              </div>
              {percentage > 0 && (
                <div className="bg-dark-steel text-yellow-400 rounded-full px-2 py-1 text-xs font-bold min-w-[40px] text-center">
                  {percentage.toFixed(0)}%
                </div>
              )}
              <div className="mt-2 text-[10px] text-dark-steel font-semibold text-center" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
                HOVER
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Mobile: Enhanced floating button with more info */}
      <motion.div
        className="md:hidden fixed bottom-4 right-4 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={() => openModal(selectedAmount || undefined)}
          className="group relative bg-gradient-to-br from-yellow-400 to-yellow-500 text-black rounded-2xl shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 flex items-center gap-3 px-4 py-3 border-2 border-steel-blue min-w-[140px]"
          whileTap={{ scale: 0.95 }}
          aria-label="Donate to Wings of Steel"
        >
          {/* Pulse animation */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 bg-yellow-300 rounded-2xl"
          />

          {/* Heart icon */}
          <FaHeart className="text-xl relative z-10 text-dark-steel" />

          {/* Text and progress */}
          <div className="relative z-10 flex flex-col items-start">
            <span className="font-bold text-sm leading-tight">Donate</span>
            {percentage > 0 && (
              <div className="text-[10px] font-semibold text-dark-steel/80">
                {percentage.toFixed(0)}% to goal
              </div>
            )}
          </div>
        </motion.button>
      </motion.div>

      {/* Mobile: Sticky bottom banner (appears after scroll) */}
      <MobileDonationBanner
        activeGoal={activeGoal}
        onDonateClick={() => {
          openModal(selectedAmount || undefined);
        }}
      />
    </>
  );
};

export default DonationSlideOut;

