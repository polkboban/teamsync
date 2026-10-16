/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        canvas: '#09090b',
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          800: '#1e2025',
          850: '#17181c',
          900: '#111215',
          950: '#09090b',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.07)',
          hover: 'rgba(255, 255, 255, 0.14)',
          active: 'rgba(255, 255, 255, 0.22)',
        },
        accent: {
          DEFAULT: '#5e6ad2',
          hover: '#4e5ac0',
          subtle: 'rgba(94, 106, 210, 0.12)',
        }
      },
      letterSpacing: {
        tightest: '-0.025em',
        tighter: '-0.015em',
      }
    },
  },
  plugins: [],
}
