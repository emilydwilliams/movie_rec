/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vintage anatomy textbook palette
        vintage: {
          cream: '#f8f1e5',      // Light parchment background
          brown: '#7e685a',      // Rich brown for text/accents
          rose: '#c8a6a6',       // Dusty rose for highlights
          beige: '#e6dbc2',      // Light tan for cards
          sage: '#9fb8ad',       // Sage green for buttons
        },
        primary: {
          50: '#f8f1e5',   // cream
          100: '#e6dbc2',  // beige
          200: '#c8a6a6',  // rose
          300: '#9fb8ad',  // sage
          400: '#7e685a',  // brown
          500: '#7e685a',  // brown (primary)
          600: '#6b5649',  // darker brown
          700: '#584538',  // darker brown
          800: '#453427',  // darker brown
          900: '#322316',  // darkest brown
        },
      },
    },
  },
  plugins: [],
}

