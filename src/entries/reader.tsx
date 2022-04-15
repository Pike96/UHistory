import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from '@emotion/react';

import Grid from '@mui/material/Grid';
import { getLocalBrowserStorage } from '../utils/browserUtils';
import theme from '../common/theme';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/700.css';
import Terms from '../components/Terms';
import * as store from '../common/store';
import { readHistoryFromDrive } from '../utils/driveUtils';
import Backdrop from '@mui/material/Backdrop';

const Reader = () => {
  const [token, setStateToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');

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
