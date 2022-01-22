import axios, { AxiosStatic, Method } from 'axios';
import { auth, cancelAuth } from './authUtils';
import {
  AxiosMethod,
  DriveRequestHeader,
  ErrorMessage,
  FolderMetadata,
} from './interfaces';
import * as store from './store';

export async function doesFileExistInDrive(filename: string): Promise<boolean> {
  const data = await listDriveFiles(
    `trashed = false and name = '${filename}'`
  );

  if (data.error) {
    throw Error(data.error);
  }

  return data && data.files && data.files.length;
}

export async function doesFolderExistsInDrive(folderName: string): Promise<boolean> {
  const data = await listDriveFiles(
    `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}'`
  );

  if (data.error) {
    throw Error(data.error);
  }

  return data && data.files && data.files.length;
}

export async function createFolderInDrive(): Promise<void> {
  const data = await createDriveFiles({
    name: 'UHistoryBackup',
    mimeType: 'application/vnd.google-apps.folder',
  });

  if (data.error) {
    throw Error(data.error);
  }
}

export async function listDriveFiles(q: string) {
  const params = {
    q,
    fields: 'nextPageToken, files(id, name)',
  };

  return await fetchDriveApiTwice(
    'get',
    'https://www.googleapis.com/drive/v3/files',
    {
      headers: getHeader(store.getToken()),
      params,
    }
  );
}

export async function createDriveFiles(folderMetadata: FolderMetadata) {
  return await fetchDriveApiTwice(
    'post',
    'https://www.googleapis.com/drive/v3/files',
    folderMetadata
  );
}

async function fetchDriveApiTwice(method: AxiosMethod, url: string, args: any) {
  const result = await fetchDriveApi(method, url, args);
  if (result && result.error) {
    await auth({ interactive: false });
    return await fetchDriveApi(method, url, args);
  } else {
    return result;
  }
}

async function fetchDriveApi(method: AxiosMethod, url: string, args: any) {
  return new Promise<any | ErrorMessage>((resolve) => {
    axios[method](url, {
      ...args,
    })
      .then((result) => {
        resolve(result.data);
      })
      .catch(async (error) => {
        if (error?.response?.data?.error?.message === 'Invalid Credentials') {
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
