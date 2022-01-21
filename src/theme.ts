import { createTheme } from '@mui/material';

declare module '@mui/material/styles' {
  interface Theme {
    button: {
      textTransform: string;
    };
  }
}

const theme = createTheme({
  typography: {
    button: {
      textTransform: 'none',
    },
  },
});

export default theme;
