import { useSelector, Provider } from 'react-redux';

import { createTheme, ThemeProvider } from '@mui/material/styles';


import { ThemeProvider, CssBaseline, IconButton } from '@mui/material';

import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from './store/themeSlice';
import { getTheme } from './theme';
import { store } from './store/index';

const App = () => {
  const themeMode = useSelector((state) => state.theme.mode);

  const theme = createTheme({
    palette: {
      mode: themeMode, // Dynamically apply 'light' or 'dark'
      primary: { main: '#325eb5' },
      secondary: { main: '#e07e27' },
      // Other palette details...
    },
    // Other theme configurations...
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <YourAppComponents />
    </ThemeProvider>
  );
};
