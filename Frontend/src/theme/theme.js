// import { createTheme } from '@mui/material/styles';

// const theme = createTheme({
//   breakpoints: {
//     xs: 0,
//     sm: 576,
//     md: 768,
//     lg: 992,
//     xl: 1336,
//   },
//   direction: 'ltr',
//   palette: {
//     common: {
//       black: '#464646',
//       white: '#fff',
//     },
//     grey: {
//       100: '#f8f8f8',
//       200: '#e3e4e4',
//       300: '#cecfd0',
//       400: '#b9babc',
//       500: '#a5a6a8',
//       600: '#909194',
//       700: '#747679',
//       disabled: '#a5a6a8',
//     },
//     primary: {
//       light: '#f1f4fa',
//       main: '#325eb5',
//       dark: '#1e386d',
//       contrastText: '#fff',
//     },
//     secondary: {
//       light: '#f4d8bc',
//       main: '#e07e27',
//       dark: '#b3651f',
//       contrastText: '#fff',
//     },
//     error: {
//       light: '#f29d9d',
//       main: '#df0909',
//       dark: '#860505',
//       contrastText: '#fff',
//     },
//     warning: {
//       light: '#ffe799',
//       main: '#ffc400',
//       dark: '#cc9d00',
//       contrastText: '#000',
//     },
//     info: {
//       light: '#90caea',
//       main: '#3ba1d9',
//       dark: '#1c6892',
//       contrastText: '#000',
//     },
//     success: {
//       light: '#9fc190',
//       main: '#408321',
//       dark: '#264f14',
//       contrastText: '#fff',
//     },
//     action: {
//       active: {
//         light: '#7986cb',
//         main: '#4F98FF',
//         dark: '#303f9f',
//         contrastText: '#fff',
//       },
//       hover: {
//         light: '#7986cb',
//         main: '#006dff',
//         dark: '#303f9f',
//         contrastText: '#fff',
//       },
//       focus: {
//         light: '#7986cb',
//         main: '#4F98FF',
//         dark: '#303f9f',
//         contrastText: '#fff',
//       },
//     },
//   },
//   shadows: {
//     1: '0 0 2px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.14)',
//     2: '0 0 2px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.14)',
//     3: '0 0 2px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.14)',
//     4: '0 0 2px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.14)',
//     5: '0 0 8px rgba(0,0,0,0.12), 0 14px 28px rgba(0,0,0,0.14)',
//   },
//   typography: {
//     fontFamily: '"Century Gothic", "Helvetica", "Arial", sans-serif',
//     fontSize: '15px',
//     lineHeight: 1.2,
//     fontWeightLight: 300,
//     fontWeightRegular: 400,
//     fontWeightMedium: 500,
//     fontWeightBold: 700,
//     h1: {
//       fontFamily: '"Century Gothic", "Helvetica", "Arial", sans-serif',
//       fontWeight: 500,
//       fontSize: '60px',
//       lineHeight: 1.167,
//       letterSpacing: '-0.01562em',
//     },
//     h2: {
//       fontFamily: '"Century Gothic", "Helvetica", "Arial", sans-serif',
//       fontWeight: 300,
//       fontSize: '3.75rem',
//       lineHeight: 1.2,
//       letterSpacing: '-0.00833em',
//     },
//     h3: {
//       fontFamily: '"Century Gothic", "Helvetica", "Arial", sans-serif',
//       fontWeight: 400,
//       fontSize: '28px',
//       lineHeight: 1.167,
//       letterSpacing: '0em',
//     },
//     h4: {
//       fontFamily: '"Century Gothic", "Helvetica", "Arial", sans-serif',
//       fontWeight: 600,
//       fontSize: '20px',
//       lineHeight: 1.2,
//       letterSpacing: '0.00735em',
//     },
//     h5: {
//       fontFamily: '"Century Gothic", "Helvetica", "Arial", sans-serif',
//       fontWeight: 400,
//       fontSize: '1.5rem',
//       lineHeight: 1.334,
//       letterSpacing: '0em',
//     },
//     h6: {
//       fontFamily: '"Century Gothic", "Helvetica", "Arial", sans-serif',
//       fontWeight: 500,
//       fontSize: '1.25rem',
//       lineHeight: 1.6,
//       letterSpacing: '0.0075em',
//     },
//     subtitle1: {
//       fontFamily: '"Century Gothic", "Helvetica", "Arial", sans-serif',
//       fontWeight: 300,
//       fontSize: '17px',
//       lineHeight: 1.2,
//       letterSpacing: '0.00938em',
//     },
//     subtitle2: {
//       fontFamily: '"Century Gothic", "Helvetica", "Arial", sans-serif',
//       fontWeight: 300,
//       fontSize: '16px',
//       lineHeight: 1.2,
//       letterSpacing: '0.00714em',
//     },
//     body1: {
//       fontFamily: '"Century Gothic", "Helvetica", "Arial", sans-serif',
//       fontWeight: 300,
//       fontSize: '1rem',
//       lineHeight: 1.5,
//       letterSpacing: '0.00938em',
//     },
//     body2: {
//       fontFamily: '"Century Gothic", "Helvetica", "Arial", sans-serif',
//       fontWeight: 300,
//       fontSize: '0.875rem',
//       lineHeight: 1.43,
//       letterSpacing: '0.01071em',
//     },
//     button: {
//       fontFamily: '"Century Gothic", "Helvetica", "Arial", sans-serif',
//       fontWeight: 400,
//       fontSize: '14px',
//       lineHeight: '1em',
//       letterSpacing: '0.05em',
//       textTransform: 'uppercase',
//     },
//     caption: {
//       fontFamily: '"Century Gothic", "Helvetica", "Arial", sans-serif',
//       fontWeight: 300,
//       fontSize: '0.75rem',
//       lineHeight: 1.66,
//       letterSpacing: '0.03333em',
//     },
//     overline: {
//       fontFamily: '"Century Gothic", "Helvetica", "Arial", sans-serif',
//       fontWeight: 300,
//       fontSize: '0.75rem',
//       lineHeight: 2.66,
//       letterSpacing: '0.08333em',
//       textTransform: 'uppercase',
//     },
//   },
//   shape: {
//     borderRadius: 4,
//   },
//   transitions: {
//     easing: {
//       easeInOut: 'cubic-bezier(0.8, 0, 0.2, 1)',
//       easeOut: 'cubic-bezier(0.1, 0.9, 0.2, 1)',
//       easeIn: 'cubic-bezier(0.9, 0.1, 1, 0.2)',
//       sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
//     },
//     duration: {
//       shortest: '100ms',
//       shorter: '150ms',
//       short: '250ms',
//       standard: '300ms',
//       complex: '375ms',
//       enteringScreen: '225ms',
//       leavingScreen: '195ms',
//     },
//   },
//   zIndex: {
//     mobileStepper: 1000,
//     speedDial: 1050,
//     appBar: 1200,
//     drawer: 1100,
//     modal: 1300,
//     snackbar: 1400,
//     tooltip: 1500,
//   },
// });

// export default theme;


import { createTheme } from '@mui/material/styles';
import customSettings from './customSettings';

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      ...customSettings.palette,
      ...(mode === 'dark' && {
        background: {
          default: '#121212',
          paper: '#1d1d1d',
        },
        text: {
          primary: '#ffffff',
          secondary: '#b0b0b0',
        },
      }),
    },
    breakpoints: customSettings.breakpoints,
    typography: customSettings.typography,
    shadows: customSettings.shadows,
    shape: customSettings.shape,
    transitions: customSettings.transitions,
    zIndex: customSettings.zIndex,
  });