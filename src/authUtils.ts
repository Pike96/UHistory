import axios from 'axios';
import {
  getLocalBrowserStorage,
  setLocalBrowserStorage,
  removeCachedAuthToken,
} from './browserUtils';
import { AuthOption } from './interfaces';

export async function authTest() {
  const token: string | null = await auth({ interactive: true });
  chrome.identity.getAuthToken({ interactive: true }, async function (token) {
    console.log(token);
    axios
      .get('https://www.googleapis.com/drive/v3/files', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((error) => {
        if (error?.response?.data?.error?.message === 'Invalid Credentials') {
          signOutForToken(token);
        }
      });
  });
}

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

export async function signOutForToken(token: string): Promise<void> {
  try {
    await Promise.all([
      token && axios.get(`https://accounts.google.com/o/oauth2/revoke?token=${token}`),
      token && removeCachedAuthToken(token),
      setLocalBrowserStorage({ accessToken: '' }),
    ]);
  } catch (e) {}
}
