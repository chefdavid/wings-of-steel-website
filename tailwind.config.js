/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Optimize for production
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  theme: {
    extend: {
      colors: {
        // Original youth team colors (backwards compatibility)
        'steel-blue': '#4682B4',
        'steel-gray': '#71797E',
        'ice-blue': '#E0F4FF',
        'dark-steel': '#2C3E50',
        // Championship gold — was referenced in 24 places across the nav, golf
        // outing and sponsorship UI but never defined, so those classes emitted
        // nothing. Base value is tuned to pair with `text-dark-steel` on top
        // (6.7:1) and to read on the dark-steel/black sections (6.7:1).
        'championship-gold': '#F5C518',
        gold: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F5C518',
          600: '#D19A00',
          // gold-700 is the only shade safe for normal-size text on white (6.7:1)
          700: '#7A5500',
          800: '#5C3E00',
          900: '#3D2900',
        },
        // Dynamic team colors using CSS custom properties
        'team-primary': 'var(--team-primary, #4682B4)',
        'team-secondary': 'var(--team-secondary, #2C3E50)',
        'team-accent': 'var(--team-accent, #E0F4FF)',
        'team-background': 'var(--team-background, #71797E)',
      },
      fontFamily: {
        'sport': ['Bebas Neue', 'sans-serif'],
        'display': ['Oswald', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

