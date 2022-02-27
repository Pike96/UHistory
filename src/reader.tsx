import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from '@emotion/react';

import Grid from '@mui/material/Grid';
import { getLocalBrowserStorage } from './browserUtils';
import theme from './theme';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/700.css';
import Terms from './Terms';
import * as store from './store';

const Reader = () => {
  const [token, setStateToken] = useState('');

  const setToken = (token: string) => {
    store.setToken(token);
    setStateToken(token);
  };

  useEffect(() => {
    if (token) return;

    getLocalBrowserStorage('accessToken').then(({ accessToken }) => {
      setToken(accessToken);
    });
  }, [token]);

  return (
    <ThemeProvider theme={theme}>
      <Grid
        container
        margin={'auto'}
        paddingTop={2}
        maxWidth={1024}
        spacing={3}
        alignItems={'center'}
        textAlign={'center'}
      >
        {token}
        <Terms />
      </Grid>
    </ThemeProvider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Reader />
  </React.StrictMode>,
  document.getElementById('root')
);
