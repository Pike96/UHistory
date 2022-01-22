import axios from 'axios';
import {
  getLocalBrowserStorage,
  setLocalBrowserStorage,
  removeCachedAuthToken,
} from './browserUtils';
import { AuthOption, ErrorMessage } from './interfaces';
import * as store from './store';

export function auth(option: AuthOption): Promise<string> {
  return new Promise<string>((resolve) => {
    try {
      chrome.identity.getAuthToken(option, async function (token: string) {
        await setLocalBrowserStorage({ accessToken: token });
        resolve(token);
      });
    } catch (e) {
      resolve('');
    }
  });
}

export async function signOut(): Promise<void | ErrorMessage> {
  const token = store.getToken();
  try {
    await Promise.all([
      token &&
        axios.get(`https://accounts.google.com/o/oauth2/revoke?token=${token}`),
      token && removeCachedAuthToken(token),
      setLocalBrowserStorage({ accessToken: '' }),
    ]);
  } catch (e) {
    return {
      error: 'Unknown problem for signing out',
    };
  }
}
