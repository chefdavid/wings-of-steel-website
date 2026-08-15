import {
  colors,
  legacyColors,
  fonts,
  fontSize,
  spacing,
  borderRadius,
  boxShadow,
  duration,
} from './src/design/tokens.js';

/**
 * All brand values come from src/design/tokens.js — do not hardcode hex here.
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  theme: {
    extend: {
      colors: {
        ...legacyColors,
        steel: colors.steel,
        ice: colors.ice,
        gold: colors.gold,
        // `slate` is a Tailwind default; ours is the brand neutral. Namespaced
        // so we don't silently change every existing `slate-*` usage.
        'steel-neutral': colors.slate,
        // Team colors resolve through CSS variables set by useTeamFromURL.
        // Only the `youth` team exists today, so these always fall back.
        'team-primary': `var(--team-primary, ${colors.steel[500]})`,
        'team-secondary': `var(--team-secondary, ${colors.steel[800]})`,
        'team-accent': `var(--team-accent, ${colors.ice[100]})`,
        'team-background': `var(--team-background, ${colors.slate[500]})`,
      },
      fontFamily: {
        sport: fonts.sport,
        display: fonts.display,
        body: fonts.body,
      },
      fontSize,
      spacing,
      borderRadius,
      boxShadow,
      transitionDuration: Object.fromEntries(
        Object.entries(duration).map(([k, v]) => [k, `${Math.round(v * 1000)}ms`])
      ),
      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': `fade-in-up ${duration.slow}s ease-out`,
      },
    },
  },
  plugins: [],
};
