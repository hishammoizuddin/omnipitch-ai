/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          slate: '#708090',
          blue: '#141e50',
          dark: '#0a0f25', // very dark background for enterprise feel
        }
      }
    },
  },
  plugins: [],
}
