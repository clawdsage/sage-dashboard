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
        // Professional dark theme palette
        sage: {
          50: '#f0f9f0',
          100: '#dbf2db',
          200: '#b8e5b8',
          300: '#88d288',
          400: '#56b856',
          500: '#3a9d3a',
          600: '#2d7d2d',
          700: '#256325',
          800: '#204f20',
          900: '#1c421c',
          950: '#0a240a',
        },
        slate: {
          850: '#1e293b',
          950: '#0f172a',
        },
        // Dashboard accent colors
        primary: {
          DEFAULT: '#3a9d3a',
          dark: '#2d7d2d',
          light: '#56b856',
        },
        secondary: {
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
          light: '#818cf8',
        },
        background: {
          DEFAULT: '#0f172a',
          card: '#1e293b',
          sidebar: '#1a2438',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}