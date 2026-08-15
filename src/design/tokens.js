/**
 * Wings of Steel — design tokens.
 *
 * THE single source of truth for brand values.
 *
 * Before this file existed, theme values were defined independently in six
 * places (tailwind.config.js, src/index.css, an inline <style> in index.html,
 * vite-plugin-critical-css.ts, .gradient-text, and CSS variables set from JS),
 * four of which hardcoded #2C3E50 / #4682B4 separately. Changing a brand color
 * meant finding all six or watching them drift.
 *
 * Plain JS with no imports on purpose: this is consumed by
 * `tailwind.config.js` (node, CJS-ish ESM), by `vite-plugin-critical-css.ts`
 * (node, build time) and by application code (browser). Keep it dependency-free.
 */

/* ------------------------------------------------------------------ color */

export const colors = {
  /** Brand blue. 500 is the historical `steel-blue` (#4682B4). */
  steel: {
    50: '#F2F7FB',
    100: '#E1EDF6',
    200: '#C3DAEC',
    300: '#96BFDC',
    400: '#6BA3CB',
    500: '#4682B4',
    600: '#3A6B94',
    700: '#305675',
    800: '#2C3E50',
    900: '#1E2B38',
    950: '#131C25',
  },

  /** Pale arena blue. 100 is the historical `ice-blue` (#E0F4FF). */
  ice: {
    50: '#F2FBFF',
    100: '#E0F4FF',
    200: '#C0E8FD',
    300: '#93D6F8',
    400: '#87CEEB',
    500: '#5BB5DC',
    600: '#3D95BC',
    700: '#2F7695',
    800: '#2A5F76',
    900: '#274F61',
  },

  /**
   * Championship gold. 500 is the base.
   *
   * Contrast, verified:
   *   gold-500 on steel-800 ................ 6.74:1  (text on dark)
   *   steel-800 on gold-500 ................ 6.74:1  (dark text on gold fill)
   *   gold-700 on white .................... 6.72:1  (only shade safe for
   *                                                   normal-size text on light)
   */
  gold: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F5C518',
    600: '#D19A00',
    700: '#7A5500',
    800: '#5C3E00',
    900: '#3D2900',
  },

  /** Neutral gray. 500 is the historical `steel-gray` (#71797E). */
  slate: {
    50: '#F8F9FA',
    100: '#F1F3F4',
    200: '#E3E6E8',
    300: '#CBD1D4',
    400: '#9AA3A8',
    500: '#71797E',
    600: '#5B6266',
    700: '#474C50',
    800: '#33373A',
    900: '#212426',
  },
};

/** Semantic aliases. Prefer these in new code over raw scale steps. */
export const semantic = {
  brand: colors.steel[500],
  brandDark: colors.steel[800],
  surfaceDark: colors.steel[800],
  surfaceMuted: colors.slate[50],
  accent: colors.gold[500],
  accentOnLight: colors.gold[700],
  focusRing: colors.ice[400],
};

/**
 * Backwards-compatible names. These are the class names used across the
 * existing 100+ components (`bg-dark-steel`, `text-ice-blue`, …). They are
 * kept so the redesign can proceed incrementally rather than as one
 * unreviewable rename.
 */
export const legacyColors = {
  'steel-blue': colors.steel[500],
  'steel-gray': colors.slate[500],
  'ice-blue': colors.ice[100],
  'dark-steel': colors.steel[800],
  'championship-gold': colors.gold[500],
};

/* ------------------------------------------------------------- typography */

export const fonts = {
  sport: ['Bebas Neue', 'Bebas Neue Fallback', 'Arial Narrow', 'sans-serif'],
  display: ['Oswald', 'Arial Narrow', 'sans-serif'],
  body: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
};

/**
 * Display type scale for section headings, so `text-3xl md:text-5xl` stops
 * being reinvented per section. [size, { lineHeight, letterSpacing }]
 */
export const fontSize = {
  'display-sm': ['1.75rem', { lineHeight: '1.15', letterSpacing: '0.02em' }],
  'display-md': ['2.5rem', { lineHeight: '1.1', letterSpacing: '0.02em' }],
  'display-lg': ['3.5rem', { lineHeight: '1.05', letterSpacing: '0.02em' }],
  'display-xl': ['4.5rem', { lineHeight: '1', letterSpacing: '0.02em' }],
};

/* ------------------------------------------------------- spacing / shape */

/**
 * Vertical rhythm for page sections. Section padding was previously `py-20`
 * in one component, `py-12 md:py-20` in the next and `py-8 md:py-16` in golf.
 */
export const spacing = {
  'section-sm': '3rem',
  section: '5rem',
  'section-lg': '7rem',
  /** Height of the fixed navigation bar. Layout reads this; nothing else should. */
  nav: '5rem',
};

export const borderRadius = {
  card: '0.75rem',
  panel: '1rem',
  pill: '9999px',
};

export const boxShadow = {
  card: '0 1px 3px rgb(19 28 37 / 0.08), 0 6px 16px -6px rgb(19 28 37 / 0.12)',
  'card-hover': '0 2px 6px rgb(19 28 37 / 0.10), 0 16px 32px -12px rgb(19 28 37 / 0.22)',
  panel: '0 24px 64px -24px rgb(19 28 37 / 0.35)',
  'glow-gold': `0 0 32px ${colors.gold[500]}59`,
};

/* ------------------------------------------------------------------ motion */

/** Durations in seconds — consumed by src/lib/motion.ts and by Tailwind (ms). */
export const duration = {
  fast: 0.2,
  base: 0.4,
  slow: 0.6,
  slower: 0.8,
};

/** Shared easing curve. Matches what the existing Framer usage feels like. */
export const easing = [0.22, 1, 0.36, 1];
