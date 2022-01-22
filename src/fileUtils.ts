import axios from 'axios';
import { signOut } from './authUtils';
import { DriveRequestHeader, ErrorMessage } from './interfaces';
import * as store from './store';

export async function driveFilesList(q: string) {
  const params = {
    q,
    fields: 'nextPageToken, files(id, name)',
  };

  return new Promise<any | ErrorMessage>((resolve) => {
    axios
      .get('https://www.googleapis.com/drive/v3/files', {
        headers: getHeader(store.getToken()),
        params,
      })
      .then((result) => {
        resolve(result.data);
      })
      .catch(async (error) => {
        if (error?.response?.data?.error?.message === 'Invalid Credentials') {
          await signOut();
          resolve({
            error:
              'Your authentication is not valid any more. Please sign in again',
          });
        } else {
          resolve(null);
        }
      });
  });
}

function getHeader(token: string): DriveRequestHeader {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}
