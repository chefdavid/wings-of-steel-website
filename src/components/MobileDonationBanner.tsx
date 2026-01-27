import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaTimes } from 'react-icons/fa';
import DonationProgressBar from './DonationProgressBar';

interface MobileDonationBannerProps {
  activeGoal: any;
  onDonateClick: () => void;
}

const MobileDonationBanner = ({ activeGoal, onDonateClick }: MobileDonationBannerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Show banner after user scrolls down 300px
    const handleScroll = () => {
      if (window.scrollY > 300 && !isDismissed) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  if (!activeGoal || isDismissed) return null;

  const percentage = activeGoal.percentage_complete || 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-dark-steel via-dark-steel to-dark-steel/95 border-t-2 border-steel-blue shadow-2xl"
        >
          <div className="px-4 py-3">
            {/* Dismiss button */}
            <button
              onClick={() => setIsDismissed(true)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors p-1"
              aria-label="Dismiss banner"
            >
              <FaTimes className="w-4 h-4" />
            </button>

            {/* Progress bar */}
            <div className="mb-2">
              <DonationProgressBar mode="compact" showDetails={true} />
            </div>

            {/* CTA Button */}
            <button
              onClick={onDonateClick}
              className="w-full bg-yellow-400 text-black py-3 rounded-lg font-bold text-base hover:bg-yellow-300 transition-all transform active:scale-95 shadow-lg flex items-center justify-center gap-2"
            >
              <FaHeart />
              <span>Support Our Players</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileDonationBanner;

