/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#7C3AFF',   // From your templates
        'secondary': '#9461FF', // From your templates
        'text-light': '#FFFFFF', // From your templates
        'text-dark': '#1A1A1A',  // From your templates
        'card-bg': 'rgba(25, 25, 25, 0.95)', // From your templates
        'shadow-color': 'rgba(0, 0, 0, 0.3)', // From your templates
        'success': '#4CAF50',
        'error': '#FF5252',
      },
    },
  },
  plugins: [],
}