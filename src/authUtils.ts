import axios from 'axios';
import { getLocalBrowserStorage, setLocalBrowserStorage } from './browserUtils';

interface AuthOption {
  interactive: boolean;
}

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

export function auth(option: AuthOption): Promise<string | null> {
  return new Promise<string | null>((resolve) => {
    try {
      chrome.identity.getAuthToken(option, async function (token: string) {
        await setLocalBrowserStorage({ accessToken: token });
        resolve(token);
      });
    } catch (e) {
      resolve(null);
    }
  });
}

export async function signOut() {
  const token = await getLocalBrowserStorage(['accessToken']);
}

export async function signOutForToken(token: string): Promise<void> {
  await axios.get(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);
  await setLocalBrowserStorage({ accessToken: null });
  chrome.identity.removeCachedAuthToken({ token });
}
