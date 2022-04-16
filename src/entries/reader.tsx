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
import CircularProgress from '@mui/material/CircularProgress';
import DatePicker from '../components/DatePicker';

const Reader = () => {
  const [token, setStateToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [countsData, setCountsData] = useState({
    map: new Map(),
    maxCount: 0,
  });

  const setToken = (token: string) => {
    store.setToken(token);
    setStateToken(token);
  };

  const loadData = async () => {
    const data = await readHistoryFromDrive();
    setCountsData(data.countsData);
    console.log(
      '🚀 ~ file: reader.tsx ~ line 24 ~ read ~ data.countsData',
      data.countsData
    );
    console.log(
      '🚀 ~ file: reader.tsx ~ line 24 ~ read ~ data.historyMap',
      data.historyMap
    );
    setLoading(false);
  };

  useEffect(() => {
    if (token) return;

    getLocalBrowserStorage('accessToken').then(({ accessToken }) => {
      setToken(accessToken);
      loadData();
    });
  }, [token]);

  return (
    <ThemeProvider theme={theme}>
      <Grid
        container
        margin={'auto'}
        paddingTop={2}
        maxWidth={1360}
        spacing={3}
        alignItems={'center'}
        justifyContent={'center'}
        textAlign={'center'}
      >
        <Grid container spacing={2}>
          <Grid container item xs={3} direction="column">
            <DatePicker countsData={countsData} setDate={setDate} />
          </Grid>
        </Grid>
        <Grid container item xs={9} direction="column"></Grid>

        <Terms />
      </Grid>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </ThemeProvider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Reader />
  </React.StrictMode>,
  document.getElementById('root')
);
