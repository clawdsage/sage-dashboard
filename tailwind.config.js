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
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-up': 'scaleUp 0.2s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'pulse-active': 'pulseActive 1.5s ease-in-out infinite',
        'ripple': 'ripple 0.6s linear',
        'heartbeat': 'heartbeat 1.2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'confetti-fall': 'confettiFall 5s linear forwards',
        'sparkle': 'sparkle 1.5s ease-out',
        'gradient-shift': 'gradientShift 3s ease infinite',
        'progress-glow': 'progressGlow 2s ease-in-out infinite',
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
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 0 0 rgba(58, 157, 58, 0.4)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 0 6px rgba(58, 157, 58, 0)',
            transform: 'scale(1.02)'
          },
        },
        pulseActive: {
          '0%, 100%': { 
            backgroundColor: 'rgba(58, 157, 58, 0.1)',
            borderColor: 'rgba(58, 157, 58, 0.3)'
          },
          '50%': { 
            backgroundColor: 'rgba(58, 157, 58, 0.2)',
            borderColor: 'rgba(58, 157, 58, 0.5)'
          },
        },
        ripple: {
          '0%': { 
            transform: 'scale(0)',
            opacity: '1'
          },
          '100%': { 
            transform: 'scale(4)',
            opacity: '0'
          },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        confettiFall: {
          '0%': { 
            transform: 'translateY(-100px) rotate(0deg)',
            opacity: '1'
          },
          '100%': { 
            transform: 'translateY(100vh) rotate(360deg)',
            opacity: '0'
          },
        },
        sparkle: {
          '0%': { 
            transform: 'scale(0) rotate(0deg)',
            opacity: '1'
          },
          '100%': { 
            transform: 'scale(1) rotate(180deg)',
            opacity: '0'
          },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        progressGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 5px rgba(58, 157, 58, 0.3)',
            filter: 'brightness(1)'
          },
          '50%': { 
            boxShadow: '0 0 15px rgba(58, 157, 58, 0.6)',
            filter: 'brightness(1.2)'
          },
        },
      },
    },
  },
  plugins: [],
}