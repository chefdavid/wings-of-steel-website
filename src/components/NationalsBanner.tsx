import { motion } from 'framer-motion';
import { FaCalendarAlt, FaTrophy, FaPlayCircle } from 'react-icons/fa';

// Hide the banner once the tournament has wrapped. The cutoff is May 4 2026
// 00:00 local — the day after the final day of the 2026 nationals. Bump
// these constants for next year's event.
const EVENT_END_LOCAL = new Date('2026-05-04T00:00:00');
// Pre-filtered to Youth Tier 2 (division 77698) so visitors land on Wings of
// Steel's bracket without having to dig through every division.
const SCHEDULE_URL =
  'https://gamesheetstats.com/seasons/14654/schedule?filter%5Bdivision%5D=77698&filter%5Bstart_time_from%5D=default%3A2026-04-28';
const STANDINGS_URL =
  'https://gamesheetstats.com/seasons/14654/standings?filter%5Bdivision%5D=77698';
const LIVESTREAM_URL = 'https://usahockeytv.com/';
const EVENT_INFO_URL = 'https://www.usahockey.com/slednationals';

const NationalsBanner = () => {
  if (Date.now() >= EVENT_END_LOCAL.getTime()) {
    return null;
  }

  return (
    <motion.aside
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-dark-steel via-steel-blue to-dark-steel border-b-2 border-yellow-400"
      aria-label="Sled hockey nationals announcement"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-6">
          <div className="text-center lg:text-left">
            <div className="text-yellow-400 text-xs sm:text-sm font-display font-bold tracking-widest uppercase">
              USA Hockey-Honda Sled Nationals · Youth Tier 2
            </div>
            <div className="text-white font-sport text-2xl sm:text-3xl leading-tight mt-1">
              Follow Wings of Steel at Sled Nationals
            </div>
            <div className="text-ice-blue text-xs sm:text-sm mt-1">
              April 30 – May 3, 2026 · McKinney &amp; Farmers Branch, Dallas, TX
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            <a
              href={SCHEDULE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-dark-steel font-semibold text-sm px-4 py-2 rounded-md transition-colors"
            >
              <FaCalendarAlt aria-hidden="true" />
              Schedule &amp; Games
            </a>
            <a
              href={STANDINGS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold text-sm px-4 py-2 rounded-md transition-colors"
            >
              <FaTrophy aria-hidden="true" />
              Standings
            </a>
            <a
              href={LIVESTREAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold text-sm px-4 py-2 rounded-md transition-colors"
            >
              <FaPlayCircle aria-hidden="true" />
              Watch Live
            </a>
          </div>
        </div>

        <div className="text-center lg:text-right mt-2 text-[11px] text-ice-blue/80">
          Streaming on USAHockeyTV ·{' '}
          <a
            href={EVENT_INFO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-yellow-400"
          >
            Tournament info
          </a>
        </div>
      </div>
    </motion.aside>
  );
};

export default NationalsBanner;
