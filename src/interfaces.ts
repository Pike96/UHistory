import { AlertColor } from '@mui/material';

export interface NotificationProps {
  message: string;
  severity: AlertColor;
  open: boolean,
  setOpen: Function;
}

export interface AuthViewProps {
  setAuthDone: Function;
  notify: Function;
}

export interface BackupViewProps {
  setAuthDone: Function;
  notify: Function;
}
