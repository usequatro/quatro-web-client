import { createMuiTheme } from '@material-ui/core/styles';

// Inject our custom theme and then create the Material Theme with those preferences
// this method takes an incomplete object and adds the mising parts
const muiTheme = createMuiTheme({
  palette: {
    primary: {
      main: 'rgb(0, 164, 196)',
      contrastText: '#fff',
    },
    secondary: { main: '#414D67' },
    background: {
      default: 'rgb(113, 135, 181)',
      secondary: 'rgb(65, 77, 103)',
      lightEmphasis: 'rgb(240, 242, 247)',
      paper: '#fff',
    },
    info: {
      main: 'rgb(65, 77, 103)',
    },
  },
  typography: {
    fontFamily: ['Work Sans', 'sans-serif'],
    button: {
      textTransform: 'inherit',
    },
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
