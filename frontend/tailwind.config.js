/** @type {import('tailwindcss').Config} */
export default {
  // Disable preflight so Tailwind's base reset does not clash with MUI's CssBaseline.
  corePlugins: {
    preflight: false
  },
  important: '#root',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6c63ff',
          dark: '#5a52e0',
          light: '#8b83ff'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}
