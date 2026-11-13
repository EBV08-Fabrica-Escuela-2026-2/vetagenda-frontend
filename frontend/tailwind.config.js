/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Barlow Condensed"', 'Manrope', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Paleta tomada del prototipo de Figma "Historial asistencial"
        brand: {
          950: '#073F53',
          900: '#074B5D',
          800: '#08647A',
          700: '#2A7182',
          600: '#008F88',
          500: '#0C9A90',
          400: '#17B890',
          100: '#D7F6EF',
          50: '#E7FAF4',
        },
        ink: {
          900: '#183746',
          800: '#203E4B',
          700: '#244250',
          600: '#496671',
          500: '#567078',
          400: '#66818D',
          300: '#8AA0A9',
        },
        line: {
          DEFAULT: '#DCE5EA',
          soft: '#D8E3E8',
        },
        canvas: '#F5F8FA',
        danger: {
          700: '#A23B44',
          600: '#C44A55',
          500: '#C7636B',
          100: '#F7DCDE',
          50: '#FFF0F1',
        },
        success: {
          700: '#087A5F',
          100: '#E4F8EF',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(7, 63, 83, 0.04), 0 8px 24px -12px rgba(7, 63, 83, 0.12)',
        drawer: '-24px 0 48px -12px rgba(7, 63, 83, 0.25)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.4s linear infinite',
        'slide-in': 'slide-in 0.25s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
