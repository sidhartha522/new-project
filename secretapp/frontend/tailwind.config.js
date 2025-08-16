/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        linkedin: {
          blue: '#0077B5',
          'blue-dark': '#005885',
          'blue-light': '#4A90B8',
          gray: '#666666',
          'gray-light': '#9CA3AF',
          'gray-dark': '#333333',
        }
      },
      fontFamily: {
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
