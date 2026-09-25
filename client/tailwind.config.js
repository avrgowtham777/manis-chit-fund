/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        navy: {
          lightest: '#e8f0fe',
          light: '#2a5080',
          DEFAULT: '#1a365d',
          dark: '#0f2440',
          darker: '#0a1728'
        },
        gold: {
          light: '#fef3c7',
          DEFAULT: '#d4a843',
          dark: '#b38622',
        },
        emerald: {
          DEFAULT: '#059669',
        }
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
