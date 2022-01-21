import { AlertColor } from '@mui/material';

export interface AuthOption {
  interactive: boolean;
}

export interface NotificationData {
  message: string;
  severity: AlertColor;
}

export interface NotificationProps extends NotificationData {
  open: boolean;
  setOpen(state: boolean): void;
}

export interface AuthViewProps {
  notify(notification: NotificationData): void;
  setToken(state: string): void;
}

export interface BackupViewProps {
  notify(notification: NotificationData): void;
  token: string;
  setToken(state: string): void;
}
