import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from '@emotion/react';

import Grid from '@mui/material/Grid';

import theme from '../common/theme';
import AuthView from '../views/AuthView';
import BackupView from '../views/BackupView';

import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/700.css';
import Terms from '../components/Terms';
import useNotification from '../hooks/useNotification';
import useToken from '../hooks/useToken';

const Popup = () => {
  const [, notify, NotificationWrapper] = useNotification();
  const [token, setToken] = useToken();

  return (
    <ThemeProvider theme={theme}>
      <Grid
        container
        paddingTop={2}
        width={408}
        minHeight={160}
        spacing={3}
        alignItems={'center'}
        textAlign={'center'}
      >
        {token ? (
          <BackupView notify={notify} setToken={setToken} />
        ) : (
          <AuthView notify={notify} setToken={setToken} />
        )}

        <NotificationWrapper />
        <Terms />
      </Grid>
    </ThemeProvider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById('root')
);
