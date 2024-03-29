import { AlertColor } from '@mui/material';

export interface AuthOptions {
  interactive: boolean;
  forceWebAuth?: boolean;
}

export interface TokenData {
  token: string;
  error?: string;
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
  InvalidToken = "We can't backup right now. Please try to sign in again.",
  UnknownSignInFailed = "We can't sign in to your drive. Please try again later",
  UserNotApprove = "We can't sign in to your drive. You may have cancelled it.",
}

export interface FolderMetadata {
  name: string;
  mimeType: string;
}

export enum SpecialMessage {
  ForceClose = 'Force to close notification.',
}
