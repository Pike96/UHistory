import { AxiosRequestHeaders } from 'axios';

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
  SignInFailed = "We can't sign in to your drive. You may have cancelled it. Please also check your browser settings",
  InvalidToken = "We can't backup right now. Please try to sign in again.",
}

export interface FolderMetadata {
  name: string;
  mimeType: string;
}

export enum SpecialMessage {
  ForceClose = 'Force to close notification.',
}

export type AxiosMethod = 'get' | 'post';
