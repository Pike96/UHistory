import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from '@emotion/react';

import Grid from '@mui/material/Grid';

import theme from './theme';
import AuthView from './AuthView';
import BackupView from './BackupView';
import Notification from './Notification';
import { NotificationData } from './interfaces';
import { getLocalBrowserStorage } from './browserUtils';
import { Button } from '@mui/material';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/700.css';

const Popup = () => {
  const [token, setToken] = useState('');
  const [notification, setNotification] = useState({
    message: '',
    severity: 'info',
  } as NotificationData);
  const [notiOpen, setNotiOpen] = useState(false);

  useEffect(() => {
    if (token) return;

    getLocalBrowserStorage('accessToken').then(({ accessToken }) => {
      setToken(accessToken);
    });
  }, [token]);

  const notify = (_notification: NotificationData) => {
    setNotification(_notification);
    setNotiOpen(true);
  };

  const handleTestCtaClick = () => {};

  return (
    <ThemeProvider theme={theme}>
      <Grid
        container
        spacing={4}
        direction="column"
        justifyContent="center"
        alignItems="center"
        width={432}
        minHeight={152}
      >
        {token ? (
          <BackupView notify={notify} token={token} setToken={setToken} />
        ) : (
          <AuthView notify={notify} setToken={setToken} />
        )}

        <Notification
          message={notification.message}
          severity={notification.severity}
          open={notiOpen}
          setOpen={setNotiOpen}
        />

        <Grid item xs={12}>
          <Button variant="outlined" onClick={handleTestCtaClick}>
            Token: {token.substring(0, 16)}
          </Button>
        </Grid>
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
