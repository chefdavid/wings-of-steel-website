import { Link } from 'react-router-dom';
import { FaHeart, FaArrowRight } from 'react-icons/fa';

/**
 * The mission statement, in one place.
 *
 * "No child pays to play" appeared in 13 files in slightly different wording,
 * and nowhere did it connect the promise to the ask. Every version now renders
 * from here, and every version ends with the donation link — because the two
 * facts only make sense together: the program is free to families *because*
 * somebody else pays for it.
 *
 * The $1,870 figure is the site's own number (see the golf outing page): sled,
 * sticks, pads, helmet, gloves and jerseys for one athlete for one season.
 * Concrete beats "please give".
 */

export const EQUIP_ONE_ATHLETE = 1870;

interface Props {
  /**
   * `banner` — full-width callout for a page body.
   * `panel`  — bordered card for a section grid.
   * `inline` — a single sentence plus link, for the end of prose.
   */
  variant?: 'banner' | 'panel' | 'inline';
  className?: string;
}

const HEADLINE = 'NO CHILD PAYS TO PLAY';

const BODY =
  'All equipment, ice time, coaching, and tournament fees are provided at no cost to families. We believe every child deserves the opportunity to play, regardless of financial circumstances.';

const WHY = `Every sled, stick, helmet and hour of ice is paid for by donations. It costs about $${EQUIP_ONE_ATHLETE.toLocaleString()} to fully equip one athlete for a season.`;

const DonateLink = ({ tone = 'gold' }: { tone?: 'gold' | 'quiet' }) =>
  tone === 'gold' ? (
    <Link
      to="/donate"
      className="inline-flex items-center gap-2 rounded-pill bg-championship-gold px-6 py-3 font-sport text-base tracking-wider text-steel-900 shadow-glow-gold transition-transform duration-fast hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-championship-gold"
    >
      <FaHeart aria-hidden="true" />
      THIS IS WHY WE NEED YOUR DONATIONS
      <FaArrowRight className="text-sm" aria-hidden="true" />
    </Link>
  ) : (
    <Link
      to="/donate"
      className="inline-flex items-center gap-1.5 font-semibold text-accent underline underline-offset-4 hover:no-underline"
    >
      This is why we need your donations
      <FaArrowRight className="text-xs" aria-hidden="true" />
    </Link>
  );

export default function NoChildPaysBanner({ variant = 'banner', className = '' }: Props) {
  if (variant === 'inline') {
    return (
      <p className={`text-sm text-ink-muted ${className}`}>
        <strong className="text-ink">{HEADLINE.toLowerCase()}</strong> — {BODY} {WHY}{' '}
        <DonateLink tone="quiet" />
      </p>
    );
  }

  const isPanel = variant === 'panel';

  return (
    <aside
      aria-labelledby="no-child-pays-heading"
      className={`relative overflow-hidden rounded-panel border border-championship-gold/30 bg-gradient-to-br from-steel-800 to-steel-950 ${
        isPanel ? 'p-6' : 'p-6 md:p-10'
      } ${className}`}
    >
      {/* Decorative gold wash — kept behind the text, never carrying meaning. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-championship-gold/10 blur-3xl"
      />

      <div className="relative">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-championship-gold">
            <FaHeart className="text-steel-900" aria-hidden="true" />
          </span>
          <h2
            id="no-child-pays-heading"
            className={`font-sport tracking-wide text-championship-gold ${
              isPanel ? 'text-2xl' : 'text-2xl md:text-display-sm'
            }`}
          >
            {HEADLINE}
          </h2>
        </div>

        <p className={`mt-4 text-white/90 leading-relaxed ${isPanel ? 'text-sm' : 'text-sm md:text-base'}`}>
          {BODY}
        </p>

        <p className={`mt-3 text-ice-200/80 leading-relaxed ${isPanel ? 'text-sm' : 'text-sm md:text-base'}`}>
          {WHY}
        </p>

        <div className="mt-6">
          <DonateLink />
        </div>
      </div>
    </aside>
  );
}
