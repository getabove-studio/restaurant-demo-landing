/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './script.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        brand: {
          dark: '#0A0A0A',
          card: '#141414',
          bg: '#F5F2EB',
          gold: '#FFD700',
          goldHover: '#FFC107',
          text: '#E5E5E5',
        }
      },
    }
  },
  plugins: [],
}