/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#18a058', // Naive UI Green
        secondary: '#2080f0',
      }
    },
  },
  plugins: [],
}
