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
        // Cyber/Dark theme color palette
        cyber: {
          50: '#f0f9ff',
          100: '#e0f2fe', 
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        neon: {
          green: '#00ff41',
          blue: '#00ffff',
          pink: '#ff1493',
          purple: '#9d4edd',
          orange: '#ff8500',
        },
        dark: {
          bg: '#0a0a0a',
          surface: '#1a1a1a',
          card: '#2a2a2a',
          border: '#3a3a3a',
          text: '#e0e0e0',
          muted: '#a0a0a0',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
        cyber: ['Orbitron', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite alternate',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scan-line': 'scan-line 2s linear infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%': { 
            boxShadow: '0 0 5px #00ff41, 0 0 10px #00ff41, 0 0 15px #00ff41',
          },
          '100%': { 
            boxShadow: '0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41',
          },
        },
        'glow': {
          '0%': { textShadow: '0 0 5px #00ffff, 0 0 10px #00ffff' },
          '100%': { textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
