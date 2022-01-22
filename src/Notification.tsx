import React, { FC, SyntheticEvent } from 'react';

import { Alert, Snackbar, SnackbarCloseReason } from '@mui/material';
import { NotificationProps } from './interfaces';

const Notification: FC<NotificationProps> = ({
  message,
  severity,
  open,
  setOpen,
}) => {
  const handleClose = (
    event: Event | SyntheticEvent<any, Event>,
    reason?: SnackbarCloseReason
  ): void => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
