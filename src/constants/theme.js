import * as colors from './colors';

export default {
  // Array of strings representing viewport widths to use for min-width media queries.
  breakpoints: ['40em', '52em', '64em'],
  // Array of numbers to use as a typographic scale
  fontSizes: [
    12, 14, 16, 20, 24, 32, 48, 64,
  ],
  // Color names that can be used in color, bg, and borderColor props
  colors: {
    appBackground: colors.SUPER_LIGHT_GRAY,
    appForeground: colors.WHITE,
    textPrimary: colors.ALMOST_BLACK,
    textSecondary: colors.LIGHT_GRAY,
    textHighlight: colors.SEA_BLUE,
    border: colors.LIGHT_GRAY,
    placeholder: colors.LIGHT_GRAY,
    inputBackground: 'transparent',
    disabled: colors.SUPER_LIGHT_GRAY,
    error: colors.ERROR_RED,
  },
  // Array of numbers for use as margin and pixel values
  space: [
    0, 4, 8, 16, 32, 64, 128, 256,
  ],
  // Values for the fontFamily prop
  fonts: {
    headline: "'Open Sans', sans-serif",
    body: 'Roboto, sans-serif',
  },
  // Values for fontWeight prop
  fontWeights: {
    lighter: 'lighter',
    normal: 'normal',
    bold: 'bold',
  },
  // Values for lineHeight prop
  lineHeights: [],
  // Values for letterSpacing prop
  letterSpacings: {},
  // Values for boxShadow prop
  shadows: {
    small: '0 0 4px rgba(0, 0, 0, .125)',
    large: '0 0 24px rgba(0, 0, 0, .125)',
  },
  // Values for border props
  borders: {},
  // Values for borderRadius props
  radii: {},
  // Values for opacity props
  opacity: {},
  // button varians
  buttons: {
    primary: {
      color: colors.WHITE,
      backgroundColor: colors.DEEP_BLUE,
    },
    outline: {
      color: colors.DEEP_BLUE,
      backgroundColor: 'transparent',
      boxShadow: 'inset 0 0 0 2px',
    },
    text: {
      color: colors.DEEP_BLUE,
      backgroundColor: 'transparent',
    },
  },
};
