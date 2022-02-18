import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from '@emotion/react';

import Grid from '@mui/material/Grid';

import theme from './theme';
import AuthView from './AuthView';
import BackupView from './BackupView';
import Notification from './Notification';
import { NotificationData, SpecialMessage } from './interfaces';
import { getLocalBrowserStorage } from './browserUtils';
import { Button, Typography } from '@mui/material';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/700.css';
import * as store from './store';
import Terms from './terms';

const Popup = () => {
  const [token, setStateToken] = useState('');
  const [notification, setNotification] = useState({
    message: '',
    severity: 'info',
  } as NotificationData);
  const [notiOpen, setNotiOpen] = useState(false);

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

  const notify = (_notification: NotificationData) => {
    if (_notification.message === SpecialMessage.ForceClose) {
      setNotiOpen(false);
      return;
    }
    setNotification(_notification);
    setNotiOpen(true);
  };

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

        <Notification
          message={notification.message}
          severity={notification.severity}
          open={notiOpen}
          setOpen={setNotiOpen}
        />

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
