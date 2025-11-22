/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/popup/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--girl-math-beige)',   // Beige background
          100: 'var(--girl-math-beige)',
          200: 'var(--girl-math-beige)',
          300: 'var(--girl-math-beige)',
          400: 'var(--girl-math-beige)',
          500: 'var(--girl-math-green)',  // Main green
          600: 'var(--girl-math-green)',  // Main green
          700: 'var(--girl-math-green-dark)',  // Darker green for hover
          800: 'var(--girl-math-green-dark)',
          900: 'var(--girl-math-green-dark)',
        },
        // Match shared CSS colors using CSS variables
        'girl-math': {
          green: 'var(--girl-math-green)',
          'green-dark': 'var(--girl-math-green-dark)',
          beige: 'var(--girl-math-beige)',
          white: 'var(--girl-math-white)',
          'text-primary': 'var(--girl-math-text-primary)',
          'text-secondary': 'var(--girl-math-text-secondary)',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

