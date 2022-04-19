import axios from 'axios';

import { AuthOption, ErrorMessage } from '../common/interfaces';
import * as store from '../common/store';
import { removeCachedAuthToken, setLocalBrowserStorage } from './browserUtils';

export function auth(option: AuthOption): Promise<string> {
  return new Promise<string>((resolve) => {
    try {
      chrome.identity.getAuthToken(option, async function (token: string) {
        await setLocalBrowserStorage({ accessToken: token });
        await setLocalBrowserStorage({
          tokenLastUpdated: new Date().getTime(),
        });
        store.setToken(token);
        resolve(token);
      });
    } catch (e) {
      resolve('');
    }
  });
}

export async function cancelAuth(): Promise<void | ErrorMessage> {
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
