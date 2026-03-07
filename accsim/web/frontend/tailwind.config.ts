import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090B',
        surface1: '#18181B',
        surface2: '#27272A',
        border: '#3F3F46',
        'text-primary': '#FAFAFA',
        'text-muted': '#A1A1AA',
        'accent-blue': '#3B82F6',
        'accent-amber': '#F59E0B',
        'data-green': '#10B981',
        'data-red': '#EF4444',
        'surface-tooltip': '#2D2D35',
        'border-tooltip': '#5A5A66',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Pretendard Variable', 'Pretendard', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'typewriter': 'typewriter 2s steps(40) forwards',
        'dot-flow': 'dotFlow 2s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        typewriter: {
          from: { width: '0' },
          to: { width: '100%' },
        },
        dotFlow: {
          from: { transform: 'translateX(-8px)' },
          to: { transform: 'translateX(calc(100vw))' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40V0H40' stroke='%2327272A' stroke-width='1'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}

export default config
