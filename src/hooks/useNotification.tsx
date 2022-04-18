import React, { useState } from 'react';
import { NotificationData, SpecialMessage } from '../common/interfaces';
import SnackbarNotification from '../components/SnackbarNotification';

function useNotification(): [
  NotificationData,
  (notification: NotificationData) => void,
  Function
] {
  const [notification, setNotification] = useState({
    message: '',
    severity: 'info',
  } as NotificationData);
  const [notiOpen, setNotiOpen] = useState(false);

  const notify = (_notification: NotificationData) => {
    if (_notification.message === SpecialMessage.ForceClose) {
      setNotiOpen(false);
      return;
    }
    setNotification(_notification);
    setNotiOpen(true);
  };

  const Notification = () => {
    return (
      <SnackbarNotification
        message={notification.message}
        severity={notification.severity}
        open={notiOpen}
        setOpen={setNotiOpen}
      />
    );
  };

  return [notification, notify, Notification];
}

export default useNotification;
