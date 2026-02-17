import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { FaHeart } from 'react-icons/fa';
import DonationProgressBar from './DonationProgressBar';
import DonationFormComponent from './DonationForm';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialAmount?: number;
  eventTag?: string;
}

const DonationModal = ({ isOpen, onClose, onSuccess, initialAmount, eventTag }: DonationModalProps) => {
  const handleSuccess = () => {
    onSuccess?.();
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-b from-dark-steel to-dark-steel/95 backdrop-blur-sm border-b-2 border-steel-blue z-10">
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl md:text-3xl font-sport text-white flex items-center gap-2 md:gap-3">
                    <FaHeart className="text-yellow-400 text-xl md:text-2xl" />
                    <span className="md:hidden">{eventTag ? 'Event Donation' : 'Donate'}</span>
                    <span className="hidden md:inline">{eventTag ? 'Event Donation' : 'Support Wings of Steel'}</span>
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors p-2 -mr-2"
                    aria-label="Close donation modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                {/* Event banner */}
                {eventTag && (
                  <div className="bg-yellow-500/15 border border-yellow-400/30 rounded-lg px-4 py-3 mb-3">
                    <p className="text-yellow-400 font-sport tracking-wide text-lg md:text-xl uppercase">
                      {eventTag === 'hockey-for-a-cause'
                        ? 'Hockey for a Cause — Entry by Donation'
                        : eventTag === 'topgolf-youth'
                        ? 'Topgolf Fundraiser — Youth Team'
                        : eventTag === 'topgolf-adult'
                        ? 'Topgolf Fundraiser — Adult Team'
                        : eventTag.replace(/-/g, ' ')}
                    </p>
                    <p className="text-gray-300 text-xs mt-1">
                      This donation will be attributed to the event. Thank you for your support!
                    </p>
                  </div>
                )}
                {/* Mobile: Compact progress indicator */}
                <div className="md:hidden">
                  <DonationProgressBar mode="compact" showDetails={false} />
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 pb-20 md:pb-6">
              <DonationFormComponent
                onSuccess={handleSuccess}
                initialAmount={initialAmount}
                eventTag={eventTag}
                embedded={false}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DonationModal;
