import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from '@emotion/react';

import Grid from '@mui/material/Grid';

import theme from './theme';
import AuthView from './AuthView';
import BackupView from './BackupView';
import Notification from './Notification';
import { NotificationProps } from './interfaces';

const Popup = () => {
  const [authDone, setAuthDone] = useState(false);

  const [notification, setNotification] = useState({
    message: '',
    severity: 'info',
  } as NotificationProps);
  const [notiOpen, setNotiOpen] = useState(false);

  const notify = (_notification: NotificationProps) => {
    setNotification(_notification);
    setNotiOpen(true);
  };

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
        {authDone ? (
          <BackupView setAuthDone={setAuthDone} notify={notify} />
        ) : (
          <AuthView setAuthDone={setAuthDone} notify={notify} />
        )}

        <Notification
          message={notification.message}
          severity={notification.severity}
          open={notiOpen}
          setOpen={setNotiOpen}
        />
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
