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

export interface HistorySearchQuery {
  text: string;
  maxResults: number;
  startTime: number;
  endTime: number;
}

export interface ErrorMessage {
  error: string;
}

export enum ErrorType {
  InvalidToken = 'Your authentication is not valid any more. Please sign in again',
}

export interface FolderMetadata {
  name: string;
  mimeType: string;
}

export type AxiosMethod = 'get' | 'post';