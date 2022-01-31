import axios, { AxiosResponse, AxiosStatic, Method } from 'axios';
import { auth, cancelAuth } from './authUtils';
import {
  AxiosMethod,
  DriveRequestHeader,
  ErrorMessage,
  ErrorType,
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
): Promise<string | boolean> {
  const data = await listDriveFiles(
    `mimeType = 'application/vnd.google-apps.folder' and trashed = false and name = '${folderName}'`
  );

  if (data.error) {
    throw Error(data.error);
  }

  return data?.files?.[0]?.id;
}

export async function createFolderInDrive(
  folderName: string
): Promise<string | boolean> {
  const data = await createDriveFiles({
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  });

  if (data.error) {
    throw Error(data.error);
  }

  return data?.id;
}

export async function saveHistoryFile(
  folderId: string,
  fileName: string,
  historyData: chrome.history.HistoryItem[]
) {
  const MIME_TYPE = 'application/json';
  const metaData = {
    name: fileName,
    mimeType: MIME_TYPE,
    parents: [folderId],
  };
  const form = new FormData();

  form.append(
    'metadata',
    new Blob([JSON.stringify(metaData)], { type: 'application/json' })
  );
  form.append('file', JSON.stringify(historyData));

  const response = await uploadDriveFile(form);
  if (response?.name) {
    return response?.name;
  }

  if (response?.error) {
    return { error: response?.error };
  }

  return null;
}

// Helper functions:

async function listDriveFiles(q: string) {
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

async function createDriveFiles(folderMetadata: FolderMetadata) {
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

async function uploadDriveFile(body: FormData) {
  return await fetchDriveApiRetryAuth(
    axios.post(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      body,
      {
        headers: {
          Authorization: `Bearer ${store.getToken()}`,
        },
      }
    )
  );
}

async function fetchDriveApiRetryAuth(
  axiosPromise: Promise<AxiosResponse<any, any>>
) {
  const result = await fetchDriveApi(axiosPromise);
  if (result?.error === ErrorType.InvalidToken) {
    await auth({ interactive: false });
    console.log('Retry auth');
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
        const errorData = error?.response?.data;

        if (errorData?.error?.message === 'Invalid Credentials') {
          resolve({
            error: ErrorType.InvalidToken,
          });
        } else if (isString(errorData)) {
          resolve({
            error: errorData,
          });
        } else {
          resolve(null);
        }
      });
  });
}

function isString(data: any) {
  return Object.prototype.toString.call(data) === '[object String]';
}

function getHeaders(token: string): DriveRequestHeader {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}
