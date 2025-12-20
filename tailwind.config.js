/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,tsx}"],
  theme: {
    extend: {
      colors:{
        "sideBlack":"#343a40"
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
}