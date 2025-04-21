/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          dark: '#121212',
          card: '#1e1e1e'
        },
        text: {
          primary: '#f5f5f5',
          secondary: '#a0a0a0'
        },
        accent: {
          primary: '#9580ff',
          secondary: '#5d4aff'
        },
        success: '#4ade80',
        warning: '#facc15',
        error: '#f87171'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'glow': 'glow 1.5s ease-in-out infinite alternate'
      },
      keyframes: {
        glow: {
          '0%': { 'box-shadow': '0 0 5px rgba(149, 128, 255, 0.7)' },
          '100%': { 'box-shadow': '0 0 20px rgba(149, 128, 255, 0.9)' }
        }
      }
    },
  },
  plugins: [],
}