/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0EFFE',
          100: '#DDD9FC',
          200: '#BDB5F9',
          400: '#8B7FF0',
          500: '#5B4EE5',
          600: '#4A3EC9',
          700: '#3B31A8',
        },
        navy: {
          900: '#0F1628',
          800: '#182040',
          700: '#1E2A52',
          600: '#243460',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

