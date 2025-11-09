/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
content: [
  './src/app/**/*.{js,ts,jsx,tsx}',
  './src/components/**/*.{js,ts,jsx,tsx}',
  './src/lib/**/*.{js,ts,jsx,tsx}',
],
  theme: {
    extend: {
      colors: {
        wb: {
          white: '#F7F7F2', // Yumuşak Beyaz
          cream: '#F4E9D8', // Sıcak Krem
          green: '#CFE3CC', // Pastel Yeşil
          olive: '#B8C49A', // Zeytin Açık Tonu
          lavender: '#CFC7E7', // Lavanta
          cinnamon: '#CBAE8E', // Tarçın Bej
        },
      },
      boxShadow: {
        soft: '0 2px 12px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
