/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        background: '#f8fafc',
        surface: '#ffffff',
        primary: '#4f46e5',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#e11d48',
        foreground: '#0f172a',
        muted: '#64748b',
        border: '#f1f5f9',
      },
      borderRadius: {
        '3xl': '2.5rem',
      },
      animation: {
        'flash': 'flash 0.5s ease-out',
      },
      keyframes: {
        flash: {
          '0%': { opacity: '1', backgroundColor: 'white' },
          '100%': { opacity: '0', backgroundColor: 'transparent' },
        }
      }
    },
  },
  plugins: [],
}
