/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'electoral-blue': '#1c3276',
        'electoral-light': '#4e8bff',
        'electoral-yellow': '#ffd700',
      },
    },
  },
  plugins: [],
}; 