import { createMuiTheme } from '@material-ui/core/styles';

import GTEestiProTextBookTtf from '../fonts/GTEestiProText-Book.ttf';
import GTEestiProTextBookWoff2 from '../fonts/GTEestiProText-Book.woff2';
import GTEestiProTextMediumTtf from '../fonts/GTEestiProText-Medium.ttf';
import GTEestiProTextMediumWoff2 from '../fonts/GTEestiProText-Medium.woff2';

const bookFontWeight = 400;
const mediumFontWeight = 700;

// Inject our custom theme and then create the Material Theme with those preferences
// this method takes an incomplete object and adds the mising parts
// @see https://material-ui.com/customization/default-theme/#default-theme
const muiTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#077ec0',
      light: '#57c7e4',
      extraLight: '#b4e3f4',
      contrastText: '#fff',
    },
    secondary: { main: '#263573' },
    background: {
      default: '#fafafa',
      paper: '#fff',
    },
    info: {
      main: '#077ec0',
    },
    success: {
      main: '#077ec0',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.54)',
    },
    action: {
      contrastHover: 'rgba(255, 255, 255, 0.08)',
    },
  },
  typography: {
    fontFamily: ['GTEestiProText', 'serif'],
    fontWeight: bookFontWeight,
    button: {
      textTransform: 'inherit',
      fontWeight: mediumFontWeight,
    },
    h1: { fontWeight: mediumFontWeight },
    h2: { fontWeight: mediumFontWeight },
    h3: { fontWeight: mediumFontWeight },
    h4: { fontWeight: mediumFontWeight },
    h5: { fontWeight: mediumFontWeight },
    h6: { fontWeight: mediumFontWeight },
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        '*': {
          'scrollbar-width': 'thin',
        },
        '*::-webkit-scrollbar': {
          width: '4px',
          height: '4px',
        },
        '@font-face': [
          {
            fontFamily: 'GTEestiProText',
            fontStyle: 'normal',
            fontDisplay: 'swap',
            fontWeight: bookFontWeight,
            src: `
              url('${GTEestiProTextBookWoff2}') format('woff2'),
              url('${GTEestiProTextBookTtf}') format('ttf')
            `,
          },
          {
            fontFamily: 'GTEestiProText',
            fontStyle: 'normal',
            fontDisplay: 'swap',
            fontWeight: mediumFontWeight,
            src: `
              url('${GTEestiProTextMediumWoff2}') format('woff2'),
              url('${GTEestiProTextMediumTtf}') format('ttf')
            `,
          },
        ],
      },
    },
    MuiTooltip: {
      tooltip: {
        fontSize: '1rem',
        backgroundColor: 'rgba(38, 53, 115, 0.9)',
      },
      arrow: {
        color: 'rgba(38, 53, 115, 0.9)',
      },
    },
  },
});

// const breakpointMd = muiTheme.breakpoints.up('md');
// Desktop
// const theme = flow(
//   fpSet(`typography.h1.${breakpointMd}.fontSize`, '3.75rem'),
//   fpSet(`typography.h2.${breakpointMd}.fontSize`, '3rem'),
//   fpSet(`typography.h3.${breakpointMd}.fontSize`, '2.125rem'),
//   fpSet(`typography.h4.${breakpointMd}.fontSize`, '1.75rem'),
//   fpSet(`typography.h5.${breakpointMd}.fontSize`, '1.5rem'),
//   fpSet(`typography.h6.${breakpointMd}.fontSize`, '1.125rem'),
//   fpSet(`typography.body1.${breakpointMd}.fontSize`, '1rem'),
//   fpSet(`typography.body2.${breakpointMd}.fontSize`, '0.9rem'),
//   fpSet(`typography.buton.${breakpointMd}.fontSize`, '0.875rem'),
// )(muiTheme);

export default muiTheme;
