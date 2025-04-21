/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '0.5rem 1rem 0.5rem 1rem', // Equal padding on left and right
        sm: '0.75rem 1.25rem 0.75rem 1.25rem',
        md: '1rem 1.5rem 1rem 1.5rem',
        lg: '1.5rem 2rem 1.5rem 2rem',
        xl: '2rem 2.5rem 2rem 2.5rem',
        '2xl': '1rem 1.5rem 1rem 1.5rem',
        '3xl': '3rem 3.5rem 3rem 3.5rem',
        '4xl': '3.5rem 4rem 3.5rem 4rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1535px',
        '3xl': '1800px',
        '4xl': '2000px',
      },
    },
    extend: {
      screens: {
        xs: '480px',
        '2xl': '1535px',
      },
      spacing: {
        '18': '4.5rem',
        '112': '28rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
