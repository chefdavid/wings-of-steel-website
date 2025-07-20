/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'steel-blue': '#4682B4',
        'steel-gray': '#71797E',
        'ice-blue': '#E0F4FF',
        'dark-steel': '#2C3E50',
      },
      fontFamily: {
        'sport': ['Bebas Neue', 'sans-serif'],
        'display': ['Oswald', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

