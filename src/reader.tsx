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
import { readHistoryFromDrive } from './driveUtils';

const Reader = () => {
  const [token, setStateToken] = useState('');

  const setToken = (token: string) => {
    store.setToken(token);
    setStateToken(token);
  };

  const read = async () => {
    const { countMap, historyMap } = await readHistoryFromDrive();
    console.log("🚀 ~ file: reader.tsx ~ line 24 ~ read ~ countMap", countMap)
    console.log("🚀 ~ file: reader.tsx ~ line 24 ~ read ~ historyMap", historyMap)
  };

  useEffect(() => {
    if (token) return;

    getLocalBrowserStorage('accessToken').then(({ accessToken }) => {
      setToken(accessToken);
      read();
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
