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
    fontFamily: [
      '"IBM Plex Sans"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
});

export default theme;
