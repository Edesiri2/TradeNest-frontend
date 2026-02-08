import forms from '@tailwindcss/forms';

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
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          indigo: '#667eea',
          purple: '#764ba2',
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
      },
      animation: {
        'blob': 'blob 7s infinite',
        'shake': 'shake 0.5s ease-in-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'gradient': 'gradient 3s ease infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #5a6fd9 0%, #6a4293 100%)',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [forms],
}