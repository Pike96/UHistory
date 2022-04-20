import axios from 'axios';

import { AuthOptions, ErrorMessage, TokenData } from '../common/interfaces';
import * as store from '../common/store';
import { removeCachedAuthToken, setLocalBrowserStorage } from './browserUtils';

const GET_AUTH_TOKEN_INVALID_ERRORS = [
  'The user turned off browser signin',
  'This API is not supported on Microsoft Edge',
];

export function auth(options: AuthOptions): Promise<TokenData> {
  if (options.forceWebAuth) {
    return webAuth(options);
  }
  return new Promise<TokenData>((resolve) => {
    try {
      chrome.identity.getAuthToken(
        { interactive: options?.interactive },
        async function (token: string) {
          if (isGetAuthTokenBanned(chrome.runtime.lastError?.message)) {
            resolve(await webAuth(options));
          } else {
            await setToken(token);
            resolve({
              token,
              error: chrome.runtime.lastError?.message,
            });
          }
        }
      );
    } catch (e) {
      resolve({
        token: '',
        error: chrome.runtime.lastError?.message,
      });
    }
  });
}

function isGetAuthTokenBanned(message: string | undefined) {
  for (const errorType of GET_AUTH_TOKEN_INVALID_ERRORS) {
    if (message?.includes(errorType)) {
      return true;
    }
  }
  return false;
}

export function webAuth(options: AuthOptions): Promise<TokenData> {
  let authUrl = 'https://accounts.google.com/o/oauth2/auth?';
  const clientId =
    '445850840649-6e47980g0ms7fiokqc0h6bpv7kpab4il.apps.googleusercontent.com'; // must be Web Application type
  const redirectUrl =
    'https://nkokmdpokpgocgabofnpkandjgchljgf.chromiumapp.org/'; // make sure to define Authorised redirect URIs in the Google Console such as https://<-your-extension-ID->.chromiumapp.org/

  const authParamsObj = {
    client_id: clientId,
    redirect_uri: redirectUrl,
    response_type: 'token',
    scope: 'https://www.googleapis.com/auth/drive.file',
    // login_hint: email, // fake or non-existent won't work
  };
  const authParams = new URLSearchParams(
    Object.entries(authParamsObj)
  ).toString();

  return new Promise<TokenData>((resolve) => {
    chrome.identity.launchWebAuthFlow(
      { url: authUrl + authParams, interactive: options?.interactive },
      async function (responseUrl) {
        if (responseUrl?.includes('access_token')) {
          const token: string =
            new URLSearchParams(
              new URL(responseUrl.replace('org/#', 'org?')).search
            ).get('access_token') || '';
          await setToken(token);
          resolve({
            token,
            error: chrome.runtime.lastError?.message,
          });
        } else {
          resolve({
            token: '',
            error: chrome.runtime.lastError?.message,
          });
        }
      }
    );
  });
}

async function setToken(token: string | null | undefined) {
  if (!token) {
    return;
  }

  await setLocalBrowserStorage({ accessToken: token });
  await setLocalBrowserStorage({
    tokenLastUpdated: new Date().getTime(),
  });
  store.setToken(token);
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
