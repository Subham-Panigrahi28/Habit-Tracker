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
          dark: '#0a0a0a',
          darker: '#050505',
          card: '#1a1a1a'
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
      },
      boxShadow: {
        'glow': '0 0 15px rgba(149, 128, 255, 0.5)',
      }
    },
  },
  plugins: [],
}
