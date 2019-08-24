import * as colors from './colors';

export default {
  // Array of strings representing viewport widths to use for min-width media queries.
  breakpoints: ['400px', '599px'],
  // Array of numbers to use as a typographic scale
  fontSizes: [
    '10px', '12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px', '64px',
  ],
  // Color names that can be used in color, bg, and borderColor props
  colors: {
    appBackground: colors.PAINT_BLUE,
    appForeground: colors.WHITE,
    barBackground: colors.DEEP_SEA_BLUE,
    textPrimary: colors.ALMOST_BLACK,
    textPrimaryOverBackground: colors.WHITE,
    textSecondary: colors.GRAY,
    textHighlight: colors.PAINT_BLUE,
    border: colors.SUPER_LIGHT_GRAY,
    borderLight: colors.SUPER_LIGHT_GRAY,
    placeholder: colors.LIGHT_GRAY,
    inputBackground: 'transparent',
    disabled: colors.SUPER_LIGHT_GRAY,
    error: colors.ERROR_RED,
    foregroundOptionHover: colors.ALMOST_WHITE,
    foregroundOptionActive: colors.SUPER_LIGHT_GRAY,
  },
  // Array of numbers for use as margin and pixel values
  space: [
    '0', '0.25rem', '0.5rem', '1rem', '1.5rem', '2rem', '4rem', '6rem',
  ],
  // Values for the fontFamily prop
  fonts: {
    headline: "'Maven Pro', sans-serif;",
    body: "'Maven Pro', sans-serif;",
  },
  // Values for fontWeight prop
  fontWeights: {
    headline: 400,
    body: 400,
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
      backgroundColor: colors.PAINT_BLUE,
      outlineColor: colors.PAINT_BLUE,
      fontWeight: 'normal',
    },
    outline: {
      color: colors.PAINT_BLUE,
      backgroundColor: 'transparent',
      boxShadow: 'inset 0 0 0 2px',
      outlineColor: colors.PAINT_BLUE,
      fontWeight: 'normal',
    },
    outlineOverBackground: {
      color: colors.WHITE,
      backgroundColor: 'transparent',
      boxShadow: 'inset 0 0 0 2px',
      outlineColor: colors.WHITE,
      fontWeight: 'normal',
    },
    text: {
      color: colors.PAINT_BLUE,
      backgroundColor: 'transparent',
      outlineColor: colors.PAINT_BLUE,
      fontWeight: 'normal',
    },
    textOverBackground: {
      color: colors.WHITE,
      backgroundColor: 'transparent',
      outlineColor: colors.WHITE,
      fontWeight: 'normal',
    },
  },
};
