import { motion } from 'framer-motion';
import { FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DonationProgressBar from './DonationProgressBar';
import MobileDonationBanner from './MobileDonationBanner';
import { useDonationGoals } from '../hooks/useDonationGoals';

const DonationSlideOut = () => {
  const { activeGoal } = useDonationGoals();
  const navigate = useNavigate();

  if (!activeGoal) {
    return null; // Don't show if no active goal
  }

  const percentage = activeGoal.percentage_complete || 0;

  return (
    <>
      {/* Desktop: compact floating donate CTA */}
      <motion.div
        className="hidden md:block fixed right-6 bottom-6 z-40"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          type="button"
          onClick={() => navigate('/donate')}
          className="group flex items-center gap-4 rounded-lg border-2 border-steel-blue bg-yellow-400 px-5 py-4 text-black shadow-2xl transition-all hover:-translate-y-1 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          aria-label="Donate to support Wings of Steel"
        >
          <FaHeart className="text-xl text-red-600" aria-hidden="true" />
          <span className="flex flex-col items-start leading-tight">
            <span className="font-sport text-lg">Donate</span>
            <span className="text-xs font-semibold text-dark-steel/80">
              Monthly goal {percentage.toFixed(0)}%
            </span>
          </span>
        </button>
        <div className="mt-2 rounded-lg border border-steel-blue bg-dark-steel/95 px-4 py-3 shadow-lg">
          <DonationProgressBar mode="floating" />
          <p className="mt-2 text-center text-xs text-ice-blue">100% supports players</p>
        </div>
      </motion.div>

      {/* Mobile: Enhanced floating button with more info */}
      <motion.div
        className="md:hidden fixed bottom-4 right-4 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={() => navigate('/donate')}
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
                Monthly goal {percentage.toFixed(0)}%
              </div>
            )}
          </div>
        </motion.button>
      </motion.div>

      {/* Mobile: Sticky bottom banner (appears after scroll) */}
      <MobileDonationBanner
        activeGoal={activeGoal}
        onDonateClick={() => {
          navigate('/donate');
        }}
      />
    </>
  );
};

export default DonationSlideOut;
