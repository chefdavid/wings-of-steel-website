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

