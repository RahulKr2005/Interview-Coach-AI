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
          navy: '#0f172a',
          dark: '#1e293b',
          teal: '#0d9488',
          tealLight: '#14b8a6',
          slate: '#334155',
          border: '#e2e8f0',
          bg: '#f8fafc',
        }
      }
    },
  },
  plugins: [],
}
