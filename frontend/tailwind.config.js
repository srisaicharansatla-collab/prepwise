/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Native React dark mode compatibility
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#58CC02', // Premium Gamified green (Duolingo style)
          dark: '#58A700',  // 3D Shadow border
          bg: '#131F24',    // Clean dark-mode background 
        }
      }
    },
  },
  plugins: [],
}
