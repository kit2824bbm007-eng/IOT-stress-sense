/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        medical: {
          bg: '#F4F7FA',
          white: '#FFFFFF',
          navy: '#0B1F33',
          sidebar: '#0B1F33',
          panel: '#07141F',
          card: '#FFFFFF',
          border: '#E2E8F0',
          blue: '#1D4ED8',
          cyan: '#25C7E8',
          green: '#20E0A0',
          red: '#FF4D5A',
          amber: '#FFB547',
        },
        ecg: {
          green: '#20E0A0',
          dark: '#07141F',
          grid: 'rgba(32, 224, 160, 0.08)',
          gridMajor: 'rgba(32, 224, 160, 0.16)',
        },
        ppg: {
          cyan: '#25C7E8',
          dark: '#07141F',
        },
        // Legacy fallbacks
        slate: {
          850: '#131b2e',
          925: '#0b1120',
          950: '#070b14',
        },
        navy: {
          800: '#111c38',
          850: '#0d162d',
          900: '#090e1f',
          950: '#050813',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(11, 31, 51, 0.06), 0 1px 2px -1px rgba(11, 31, 51, 0.04)',
        'glow-green': '0 0 16px -2px rgba(32, 224, 160, 0.35)',
        'glow-cyan': '0 0 16px -2px rgba(37, 199, 232, 0.35)',
      },
    },
  },
  plugins: [],
}
