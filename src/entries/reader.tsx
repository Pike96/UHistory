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
import HistoryList from '../components/HistoryList';
import { getDateStringFromDate } from '../utils/timeUtils';
import { Box, styled } from '@mui/material';

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

const Reader = () => {
  const [token, setStateToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(getDateStringFromDate(new Date()));
  const [countsData, setCountsData] = useState({
    map: new Map(),
    maxCount: 0,
  });
  const [historyMap, setHistoryMap] = useState(new Map());

  const setToken = (token: string) => {
    store.setToken(token);
    setStateToken(token);
  };

  const loadData = async () => {
    const data = await readHistoryFromDrive();
    setCountsData(data.countsData);
    setHistoryMap(data.historyMap);
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
        width={'100%'}
        maxWidth={1360}
        spacing={3}
        alignItems={'center'}
        justifyContent={'center'}
        textAlign={'center'}
      >
        <Container>
          <DatePicker countsData={countsData} setDate={setDate} />
          <HistoryList dailyHistory={historyMap.get(date)} />
        </Container>

        <Grid container item spacing={2}>
          <Terms />
        </Grid>
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
