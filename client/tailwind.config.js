/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1e3a5f',
          light: '#2a5080',
          dark: '#152d4a',
        },
        gold: {
          DEFAULT: '#d4a843',
        }
      },
    },
  },
  plugins: [],
}
