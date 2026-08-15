import type { Variants, Transition } from 'framer-motion';
// @ts-expect-error - plain JS token module, intentionally untyped
import { duration, easing } from '../design/tokens.js';

/**
 * Shared Framer Motion variants.
 *
 * 76 components currently repeat some variation of
 *   initial={{ opacity: 0, y: 20 }}
 *   whileInView={{ opacity: 1, y: 0 }}
 *   transition={{ duration: 0.6 }}
 *   viewport={{ once: true }}
 * inline, with drifting durations and offsets. Use these instead so the site's
 * motion language can be tuned in one place.
 *
 * Existing components are migrated to these as they are restyled — see
 * vault/DECISIONS.md.
 */

const baseTransition: Transition = {
  duration: duration.slow,
  ease: easing,
};

/** Standard section entrance: fade up as it scrolls into view. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: baseTransition },
};

/** Same, but larger travel — for hero-scale elements. */
export const fadeUpLg: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { ...baseTransition, duration: duration.slower } },
};

/** Plain fade, no movement. Use where translation would cause layout jitter. */
export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: baseTransition },
};

/** Scale in from slightly small — badges, medallions, stat tiles. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { ...baseTransition, duration: duration.base } },
};

/** Parent that staggers its children. Pair with `fadeUp` on each child. */
export const stagger = (gap = 0.08): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: gap } },
});

/**
 * Spread onto a motion element for the common scroll-into-view case:
 *   <motion.div {...inView} variants={fadeUp}>
 */
export const inView = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, amount: 0.2 },
} as const;

/**
 * Spread for the on-mount case (above-the-fold content that should not wait
 * for a scroll trigger):
 *   <motion.div {...onMount} variants={fadeUpLg}>
 */
export const onMount = {
  initial: 'hidden',
  animate: 'visible',
} as const;
