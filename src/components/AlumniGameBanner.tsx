import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaHockeyPuck } from 'react-icons/fa';
import { useEventVisibility } from '../hooks/useEventVisibility';
import { isDevPreview } from '../utils/devPreview';

// Comes down by itself the morning after the game, so a "register" banner
// never outlives the event. Hiding the event in admin takes it down sooner.
const EVENT_END_LOCAL = new Date('2027-02-21T00:00:00');

const AlumniGameBanner = () => {
  const { isEventVisible, loading } = useEventVisibility();

  if (loading || (!isEventVisible('alumni-game') && !isDevPreview())) return null;
  if (Date.now() >= EVENT_END_LOCAL.getTime()) return null;

  return (
    <motion.aside
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-red-800 via-red-700 to-red-800 border-b-2 border-yellow-400"
      aria-label="25th Anniversary Alumni Game announcement"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-6">
          <div className="flex items-center gap-4 text-center lg:text-left">
            <FaHockeyPuck className="hidden sm:block text-yellow-400 text-3xl sm:text-4xl flex-shrink-0" aria-hidden="true" />
            <div>
              <div className="text-yellow-400 text-xs sm:text-sm font-display font-bold tracking-widest uppercase">
                Celebrating 25 Years of the Wings of Steel
              </div>
              <div className="text-white font-sport text-2xl sm:text-3xl leading-tight mt-1">
                25th Anniversary Alumni Game
              </div>
              <div className="text-red-50 text-xs sm:text-sm mt-1">
                Saturday, February 20 · 2:00 PM · Flyers Training Center
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:flex-shrink-0">
            <Link
              to="/alumni-game#register"
              className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-dark-steel font-semibold text-sm px-5 py-2.5 rounded-md transition-colors"
            >
              Register to Play
            </Link>
            <Link
              to="/alumni-game"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold text-sm px-4 py-2.5 rounded-md transition-colors"
            >
              Event Details
            </Link>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default AlumniGameBanner;
