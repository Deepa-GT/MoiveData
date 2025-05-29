/** @type {import('tailwindcss').Config} */
module.exports = {
 content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-fast': 'spin 0.6s linear infinite',
      },
    },
  },
  plugins: [],
}


