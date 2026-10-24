/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        dark: {
          bg: '#0B0F19',      // Deep midnight blue
          card: '#111827',    // Dark gray/blue for cards
          border: '#1F2937',  // Subtle borders
        },
        brand: {
          500: '#8B5CF6',     // Violet accent
          600: '#7C3AED',     // Darker violet
        }
      }
    },
  },
  plugins: [],
}