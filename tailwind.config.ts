import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        body: ['var(--font-dm-sans)', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      colors: {
        void: {
          950: '#080B12',
          900: '#0D1117',
          800: '#161B27',
          700: '#1E2535',
          600: '#2A3347',
        },
        arc: {
          400: '#4DFFD2',
          500: '#00E5B4',
          600: '#00C49A',
        },
        diamond: {
          400: '#A5D8FF',
          500: '#60A5FA',
          600: '#3B82F6',
        },
      },
      backgroundImage: {
        'mesh-dark': `
          radial-gradient(at 20% 20%, hsla(210,100%,16%,0.4) 0px, transparent 50%),
          radial-gradient(at 80% 80%, hsla(165,100%,16%,0.3) 0px, transparent 50%)
        `,
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'rotate-slow': 'rotateSlow 20s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        rotateSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      boxShadow: {
        'card': '0 0 0 1px rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.6)',
        'card-glow': '0 0 0 1px rgba(77,255,210,0.2), 0 24px 64px rgba(0,0,0,0.6)',
        'diamond': '0 0 0 1px rgba(165,216,255,0.3), 0 0 40px rgba(96,165,250,0.2)',
      },
    },
  },
  plugins: [],
};

export default config;