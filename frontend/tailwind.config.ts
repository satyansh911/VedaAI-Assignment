import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        page: '#EEEEEE',
        'page-dark': '#0E0E10',
        surface: '#FFFFFF',
        'surface-dark': '#1A1A1D',
        'surface-dark-2': '#222226',
        inset: '#E8E8E8',
        'inset-dark': '#2A2A2E',
        ink: {
          900: '#1A1A1A',
          800: '#2A2A2A',
          700: '#404040',
          500: '#737373',
          400: '#A3A3A3',
          300: '#D4D4D4',
          200: '#E5E5E5',
          100: '#F5F5F5',
        },
        accent: {
          DEFAULT: '#FB7C30',
          50: '#FFF1EB',
          100: '#FFE0CC',
          400: '#FF9359',
          500: '#FB7C30',
          600: '#E96A1F',
          700: '#C5571A',
        },
        success: '#22C55E',
        difficulty: {
          easy: '#22C55E',
          easyBg: '#ECFDF5',
          moderate: '#F59E0B',
          moderateBg: '#FFFBEB',
          hard: '#EF4444',
          hardBg: '#FEF2F2',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        panel: '0 1px 3px rgba(0,0,0,0.04), 0 10px 30px rgba(0,0,0,0.06)',
        card: '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)',
        'accent-glow': '0 0 0 2px #FB7C30, 0 6px 20px rgba(251,124,48,0.35)',
        'dark-pill': '0 4px 14px rgba(0,0,0,0.25)',
      },
      borderRadius: {
        pill: '999px',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
