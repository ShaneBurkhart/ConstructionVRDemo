const { blueGray } = require('tailwindcss/colors');

const viewHeights = {
  '1/4-screen': '25vh',
  '1/2-screen': '50vh',
  '3/4-screen': '75vh',
  '4/5-screen': '80vh',
}

module.exports = {
  mode: 'jit', // https://tailwindcss.com/docs/just-in-time-mode
  purge: {
    enabled: true,
    content: [
      '../react/**/*.js',
      '../react/**/*.jsx',
    ]
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        blueGray,
        brightGreen: '#40A819',
        teal: '#00b5ad',
        tealDark: '#009c95',
      },
      fontSize: {
        'xxs': ['0.65rem', '0.85rem'], // [fontSize, lineHeight]
      },
      minWidth: {
        '4': '1rem',
        '8': '2rem',
        '12': '3rem',
        '24': '6rem',
        '32': '8rem',
        '40': '10rem',
        '56': '14rem',
        '64': '16rem',
        '72': '18rem',
        '400px': '400px',
        '650px': '650px',
        '900px': '900px',
        '2/5': '40%',
        '1/2': '50%',
      },
      maxWidth: {
        '40': '10rem',
        '60': '15rem',
        '120': '30rem',
        '2/5': '40%',
        '1/2': '50%',
        '1/2-screen': '50vw',
        '400px': '400px',
      },
      height: {
        '15/100': '15%',
      },
      minHeight: {
        ...viewHeights,
        '48': '12rem',
      },
      maxHeight: {
        ...viewHeights,
      },
      zIndex: {
        '75': 75,
        '100': 100,
        '500': 500,
      },
      screens: {
        'xs': '500px',
      }
    },
  },
  variants: {},
  plugins: [
    require('@tailwindcss/forms'),
  ],
}