/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        grzprimary: '#00B2A6',
        grzsecondary: '#00A095',
        gztprimary: '#EF4058',
        frgprimary: '#437C99',
        frgsecondary: '#234158',
        frg900: '#233446',
        frg700: '#2E5C74',
        frg600: '#4D6697',
        'frgslate-gray': '#B0B8C1',
        'frgslate-gray-300': '#9FABB9',
        'system-text': '#7D7D7D',
        'system-ligth': '#c9c9c9',
        'system-blue-gray': '#4B5563',
        btnmail: '#0000FF',
        btnsms: '#A020F0',
      },
      borderColor: {
        btnmail: '#0000FF',
        btnsms: '#A020F0',
      },
      fontSize: {
        'lg-custom': '18px',
      },
      height: { '0.65h': '65%' },
      borderWidth: {
        'light-border': '0.5px',
      },
      backgroundColor: {
        grzprimary: '#00B2A6',
        grzsecondary: '#00A095',
        frgprimary: '#437C99',
        frgsecondary: '#234158',
        frg900: '#233446',
        frg700: '#2E5C74',
        frg600: '#4D6697',
        inputbg: '#f5f5f5',
        'frgslate-gray': '#B0B8C1',
        'frgslate-gray-300': '#9FABB9',
      },
    },
  },
  plugins: [],
}
