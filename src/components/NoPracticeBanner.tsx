import { FaExclamationTriangle } from 'react-icons/fa';

// One-day notice. Auto-hides at midnight after the day it announces, so it never
// goes stale. For the next one, change these two constants.
const HIDE_AFTER_LOCAL = new Date('2026-10-16T00:00:00');
const DAY_LABEL = 'Thursday, October 15';

const NoPracticeBanner = () => {
  if (Date.now() >= HIDE_AFTER_LOCAL.getTime()) return null;

  return (
    <aside
      role="alert"
      className="bg-red-600 border-b-4 border-yellow-400"
      aria-label={`No practice ${DAY_LABEL}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6 flex items-center justify-center gap-4 text-center">
        <FaExclamationTriangle className="hidden sm:block text-yellow-300 text-4xl sm:text-5xl flex-shrink-0" aria-hidden="true" />
        <div>
          <div className="text-white font-sport text-4xl sm:text-6xl leading-none tracking-wide uppercase">
            No Practice Oct 15th
          </div>
          <div className="text-yellow-200 text-sm sm:text-lg font-semibold mt-2">{DAY_LABEL}</div>
        </div>
        <FaExclamationTriangle className="hidden sm:block text-yellow-300 text-4xl sm:text-5xl flex-shrink-0" aria-hidden="true" />
      </div>
    </aside>
  );
};

export default NoPracticeBanner;
