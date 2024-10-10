/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'card-yellow': '#FFEBC6',
      },
      spacing: {
        'left-menu': '150px',
        'card': '180px'
      },
      minHeight: {
        'left-menu': 'calc(100% - 48px)',
      },
      maxHeight: {
        'left-menu': 'calc(100% - 48px)',
      },
      minWidth: {
        'left-menu': '120px',
      },
      maxWidth: {
        'left-menu': '120px',
      },
      width: {
        'rect': '1368px',
      },
      height: {
        'rect': '175px',
      },
      borderWidth: {
        'rect': '0.86px',
      },
    },
  },
  plugins: [],
}

