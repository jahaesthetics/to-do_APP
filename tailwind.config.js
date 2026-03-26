/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // CSS variable-driven palette — changes with theme
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        surfaceAlt: 'var(--color-surface-alt)',
        border: 'var(--color-border)',
        primary: 'var(--color-primary)',
        primaryHover: 'var(--color-primary-hover)',
        textPrimary: 'var(--color-text-primary)',
        textSecondary: 'var(--color-text-secondary)',
        textMuted: 'var(--color-text-muted)',
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
        warning: 'var(--color-warning)',
        coin: '#F5C542',
        streak: '#FF6B35',
      },
      boxShadow: {
        glass: '0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
        glow: '0 0 20px var(--color-primary-glow)',
        'glow-sm': '0 0 10px var(--color-primary-glow)',
        card: '0 2px 16px rgba(0,0,0,0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-shimmer':
          'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
      },
      keyframes: {
        'slide-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 6px var(--color-primary-glow)' },
          '50%': { boxShadow: '0 0 18px var(--color-primary-glow)' },
        },
        'streak-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'check-draw': {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'slide-in-up': 'slide-in-up 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-in-left': 'slide-in-left 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in': 'fade-in 0.25s ease forwards',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        'streak-pulse': 'streak-pulse 1.5s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'bounce-in': 'bounce-in 0.5s cubic-bezier(0.36,0.07,0.19,0.97)',
        float: 'float 3s ease-in-out infinite',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
