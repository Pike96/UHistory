import axios, { AxiosResponse, AxiosStatic, Method } from 'axios';
import { auth, cancelAuth } from './authUtils';
import {
  AxiosMethod,
  DriveRequestHeader,
  ErrorMessage,
  FolderMetadata,
} from './interfaces';
import * as store from './store';

export async function doesFileExistInDrive(filename: string): Promise<boolean> {
  const data = await listDriveFiles(`trashed = false and name = '${filename}'`);

  if (data.error) {
    throw Error(data.error);
  }

  return data?.files?.length;
}

export async function getFolderIdFromDrive(
  folderName: string
): Promise<string|boolean> {
  const data = await listDriveFiles(
    `mimeType = 'application/vnd.google-apps.folder' and trashed = false and name = '${folderName}'`
  );

  if (data.error) {
    throw Error(data.error);
  }

  return data?.files?.[0]?.id;
}

export async function createFolderInDrive(): Promise<string|boolean> {
  const data = await createDriveFiles({
    name: 'UHistoryBackup',
    mimeType: 'application/vnd.google-apps.folder',
  });

  if (data.error) {
    throw Error(data.error);
  }

  return data?.id;
}

export async function listDriveFiles(q: string) {
  const params = {
    q,
    fields: 'nextPageToken, files(id, name)',
  };

  return await fetchDriveApiRetryAuth(
    axios.get('https://www.googleapis.com/drive/v3/files', {
      headers: getHeaders(store.getToken()),
      params,
    })
  );
}

export async function createDriveFiles(folderMetadata: FolderMetadata) {
  return await fetchDriveApiRetryAuth(
    axios.post(
      'https://www.googleapis.com/drive/v3/files',
      {
        ...folderMetadata,
      },
      { headers: getHeaders(store.getToken()) }
    )
  );
}

async function fetchDriveApiRetryAuth(
  axiosPromise: Promise<AxiosResponse<any, any>>
) {
  const result = await fetchDriveApi(axiosPromise);
  if (result?.error) {
    await auth({ interactive: false });
    return await fetchDriveApi(axiosPromise);
  } else {
    return result;
  }
}

async function fetchDriveApi(axiosPromise: Promise<AxiosResponse<any, any>>) {
  return new Promise<any | ErrorMessage>((resolve) => {
    axiosPromise
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

function getHeaders(token: string): DriveRequestHeader {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}
