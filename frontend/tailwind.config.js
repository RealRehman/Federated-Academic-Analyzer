/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      colors: {
        navy: { 950: '#070b1a', 900: '#0b1226', 800: '#111a35', 700: '#1a2547' },
        brand: { 50: '#eef2ff', 100: '#e0e7ff', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca' },
        violet: { 500: '#8b5cf6', 600: '#7c3aed' },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.05), 0 8px 24px -12px rgba(15,23,42,.12)',
        lift: '0 2px 4px rgba(15,23,42,.06), 0 18px 36px -14px rgba(79,70,229,.30)',
      },
    },
  },
  plugins: [],
};
