import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DonationProgressBar from './DonationProgressBar';
import MobileDonationBanner from './MobileDonationBanner';
import { useDonationGoals } from '../hooks/useDonationGoals';

const DonationSlideOut = () => {
  const { activeGoal } = useDonationGoals();
  const navigate = useNavigate();
  const [pastHero, setPastHero] = useState(false);

  // The hero already carries the primary Donate CTA. Holding the floating
  // chip back until the hero scrolls away keeps one gold CTA per viewport.
  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!activeGoal || !pastHero) {
    return null; // Don't show if no active goal or still on the hero
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
            {/* "Monthly goal 0%" reads as a failing campaign — only show real progress. */}
            {percentage > 0 && (
              <span className="text-xs font-semibold text-dark-steel/80">
                Monthly goal {percentage.toFixed(0)}%
              </span>
            )}
          </span>
        </button>
        {percentage > 0 && (
          <div className="mt-2 rounded-lg border border-steel-blue bg-dark-steel/95 px-4 py-3 shadow-lg">
            <DonationProgressBar mode="floating" />
            <p className="mt-2 text-center text-xs text-ice-blue">100% supports players</p>
          </div>
        )}
      </motion.div>

      {/* Mobile: the sticky bottom banner below is the one floating donate
          CTA — a second chip stacked on top of it doubled the ask. */}

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
