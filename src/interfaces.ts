import { AlertColor } from '@mui/material';
import { AxiosRequestHeaders } from 'axios';

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
  setToken(state: string): void;
}

export interface SignOutProps extends BackupViewProps {
  loading: boolean;
  setLoading(state: boolean): void;
}

export interface DriveRequestHeader extends AxiosRequestHeaders {
  Authorization: string;
  Accept: string;
  'Content-Type': string;
}

export interface ErrorMessage {
  error: string;
}
