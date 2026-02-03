/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./services/**/*.{js,jsx,ts,tsx}",
    "./context/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#FFD700',      // Horibol Gold
        secondary: '#333333',
        surface: '#FFFFFF',
        background: '#F5F5F5',
        error: '#EF4444',
        success: '#10B981',
      }
    },
  },
  plugins: [],
}
