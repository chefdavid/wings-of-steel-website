import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaGolfBall, FaTicketAlt } from 'react-icons/fa';
import { useEventVisibility } from '../hooks/useEventVisibility';
import { isDevPreview } from '../utils/devPreview';

// Auto-hide the moment the event is over, so a stale "buy tickets" banner never
// outlives the fundraiser. Cutoff is Oct 26 2026 00:00 local — the morning after.
// Bump these three constants for next year's outing.
const EVENT_END_LOCAL = new Date('2026-10-26T00:00:00');
const EVENT_DATE_LABEL = 'Sunday, October 25 · 11 AM – 2 PM';
const EVENT_VENUE_LABEL = 'Topgolf Mount Laurel, NJ';

const TopgolfBanner = () => {
  // Same switch the /topgolf route and the events page obey, so hiding the event
  // in admin takes the banner down with it instead of stranding a dead CTA.
  const { isEventVisible, loading } = useEventVisibility();

  if (loading || (!isEventVisible('topgolf') && !isDevPreview())) return null;
  if (Date.now() >= EVENT_END_LOCAL.getTime()) return null;

  return (
    <motion.aside
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 border-b-2 border-yellow-400"
      aria-label="Topgolf fundraiser ticket announcement"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-6">
          <div className="flex items-center gap-4 text-center lg:text-left">
            <FaGolfBall
              className="hidden sm:block text-yellow-400 text-3xl sm:text-4xl flex-shrink-0"
              aria-hidden="true"
            />
            <div>
              <div className="text-yellow-400 text-xs sm:text-sm font-display font-bold tracking-widest uppercase">
                Topgolf Fundraiser · Benefiting the Youth Team
              </div>
              <div className="text-white font-sport text-2xl sm:text-3xl leading-tight mt-1">
                $25 to Play — Tickets On Sale Now
              </div>
              <div className="text-emerald-50 text-xs sm:text-sm mt-1">
                {EVENT_DATE_LABEL} · {EVENT_VENUE_LABEL}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:flex-shrink-0">
            <Link
              to="/topgolf"
              className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-dark-steel font-semibold text-sm px-5 py-2.5 rounded-md transition-colors"
            >
              <FaTicketAlt aria-hidden="true" />
              Get Tickets
            </Link>
            <Link
              to="/topgolf#details"
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

export default TopgolfBanner;
