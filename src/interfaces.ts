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

export interface SignOutProps {
  loading: boolean;
  signOut(): Promise<void>;
}

export interface DriveRequestHeader extends AxiosRequestHeaders {
  Authorization: string;
  Accept: string;
  'Content-Type': string;
}

export interface ErrorMessage {
  error: string;
}

export interface FolderMetadata {
  name: string;
  mimeType: string;
}

export type AxiosMethod = 'get' | 'post';
