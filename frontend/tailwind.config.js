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
        display: ['Panchang', 'sans-serif'],
        sans: ['Switzer', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        carbon: {
          950: '#06070a',
          900: '#0b0d13',
          850: '#10131c',
          800: '#161925',
          750: '#1d2130',
          700: '#262b3e',
          600: '#383f58',
          500: '#525b7a',
          400: '#7c86a6',
          300: '#a6b0cf',
          200: '#d0d7ed',
          100: '#eef2fb',
        },
        telemetry: {
          green: '#10b981',
          cyan: '#06b6d4',
          amber: '#f59e0b',
          rose: '#f43f5e',
          blue: '#3b82f6',
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.25)',
        'glow-green': '0 0 20px -4px rgba(16, 185, 129, 0.3)',
      }
    },
  },
  plugins: [],
}
