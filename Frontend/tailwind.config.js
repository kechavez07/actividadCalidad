/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './apps/web/index.html',
    './apps/web/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        fifa: {
          dark: '#0a0e1a',
          darker: '#060810',
          navy: '#0d1b2e',
          blue: '#1a3a5c',
          gold: '#c9a227',
          'gold-light': '#f0c84a',
          'gold-dark': '#a07c10',
          silver: '#b0b8c4',
          green: '#2d5a27',
          'green-pitch': '#3a7a30',
          red: '#c0392b',
        },
        seat: {
          available: '#22c55e',
          sold: '#6b7280',
          selected: '#c9a227',
          hover: '#16a34a',
        },
        zone: {
          north: '#3b82f6',
          south: '#8b5cf6',
          east: '#f59e0b',
          west: '#ef4444',
          vip: '#c9a227',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Oswald', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0a0e1a 0%, #0d1b2e 50%, #1a3a5c 100%)',
        'gradient-gold': 'linear-gradient(135deg, #c9a227 0%, #f0c84a 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(20px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        pulseGold: { '0%, 100%': { boxShadow: '0 0 0 0 rgba(201,162,39,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(201,162,39,0)' } },
      },
    },
  },
  plugins: [],
};
