import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart } from 'react-icons/fa';
import { X } from 'lucide-react';
import DonationModal from './DonationModal';
import DonationProgressBar from './DonationProgressBar';
import { useDonationGoals } from '../hooks/useDonationGoals';

const DonationFloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { activeGoal } = useDonationGoals();

  useEffect(() => {
    // Check if user has dismissed the button (stored in localStorage)
    const dismissedUntil = localStorage.getItem('donationButtonDismissedUntil');
    if (dismissedUntil) {
      const dismissedDate = new Date(dismissedUntil);
      if (dismissedDate > new Date()) {
        setIsDismissed(true);
      } else {
        // Dismissal period expired, clear it
        localStorage.removeItem('donationButtonDismissedUntil');
      }
    }
  }, []);

  const handleDismiss = () => {
    // Dismiss for 7 days
    const dismissedUntil = new Date();
    dismissedUntil.setDate(dismissedUntil.getDate() + 7);
    localStorage.setItem('donationButtonDismissedUntil', dismissedUntil.toISOString());
    setIsDismissed(true);
  };

  const handleSuccess = () => {
    setIsOpen(false);
    // Optionally refresh the page or show a success message
  };

  if (isDismissed || !activeGoal) {
    return null;
  }

  const percentage = activeGoal.percentage_complete || 0;

  return (
    <>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-40 md:bottom-8 md:right-8"
      >
        <motion.button
          onClick={() => setIsOpen(true)}
          className="group relative bg-yellow-400 text-black rounded-full shadow-2xl hover:bg-yellow-300 transition-all duration-300 flex flex-col items-center justify-center p-4 md:p-5 min-w-[64px] min-h-[64px] md:min-w-[72px] md:min-h-[72px] border-2 border-steel-blue"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Donate to Wings of Steel"
        >
          {/* Pulse animation */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 bg-yellow-300 rounded-full"
          />

          {/* Heart icon */}
          <FaHeart className="text-2xl md:text-3xl relative z-10 mb-1 text-dark-steel" />

          {/* Progress indicator */}
          <div className="w-12 md:w-14 mt-1 relative z-10">
            <DonationProgressBar mode="floating" />
          </div>

          {/* Hover text */}
          <div className="absolute -top-12 right-0 bg-dark-steel text-white px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm font-semibold pointer-events-none">
            Donate Now
            <div className="absolute bottom-0 right-4 transform translate-y-full">
              <div className="border-4 border-transparent border-t-dark-steel"></div>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="absolute -top-2 -right-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
            aria-label="Dismiss donation button"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.button>
      </motion.div>

      <DonationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default DonationFloatingButton;

