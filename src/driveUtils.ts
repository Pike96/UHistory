import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { auth } from './authUtils';
import { ErrorMessage, ErrorType, FolderMetadata } from './interfaces';
import * as store from './store';

export async function doesFileExistInDrive(
  fileName: string,
  folderId: string
): Promise<boolean> {
  const data = await listDriveFiles(
    `trashed = false and name = '${fileName}' and '${folderId}' in parents`
  );

  if (data.error) {
    throw Error(data.error);
  }

  return data?.files?.length;
}

export async function readHistoryFromDrive() {
  const files = await listAllHistoryFiles();
  const countMap = new Map();
  const historyMap = new Map();
  for (const file of files) {
    for (const item of await getFileData(file.id)) {
      const date = getDateString(item.lastVisitTime);
      countMap.set(date, countMap.has(date) ? countMap.get(date) + 1 : 0);
      historyMap.set(
        date,
        historyMap.has(date) ? [...historyMap.get(date), item] : []
      );
    }
  }
  return {
    countMap: flatCountMap(countMap),
    historyMap,
  };
}

function flatCountMap(map: Map<string, any>) {
  return Array.from(map, ([date, count]) => ({
    date: new Date(date),
    count,
  })).sort((a: any, b: any) => a.date - b.date);
}

function getDateString(timestamp: number) {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

function getDateFromDateString(timestamp: number) {
  return new Date(getDateString(timestamp));
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

async function listAllHistoryFiles() {
  const data = await listDriveFiles(
    "trashed = false and name contains 'UHB' and name contains 'json'"
  );

  return data?.files;
}

async function getFileData(fileId: string) {
  return await fetchDriveApiRetryAuth({
    method: 'get',
    url: `https://www.googleapis.com/drive/v3/files/${fileId}`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    params: {
      alt: 'media',
    },
  });
}

async function listDriveFiles(q: string) {
  const params = {
    q,
    fields: 'nextPageToken, files(id, name)',
  };

  return await fetchDriveApiRetryAuth({
    method: 'get',
    url: 'https://www.googleapis.com/drive/v3/files',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    params,
  });
}

async function createDriveFiles(folderMetadata: FolderMetadata) {
  return await fetchDriveApiRetryAuth({
    method: 'post',
    url: 'https://www.googleapis.com/drive/v3/files',
    data: {
      ...folderMetadata,
    },
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
}

async function uploadDriveFile(body: FormData) {
  return await fetchDriveApiRetryAuth({
    method: 'post',
    url: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    data: body,
  });
}

async function fetchDriveApiRetryAuth(config: AxiosRequestConfig) {
  setHeaderAuth(config);
  const result = await fetchDriveApi(axios(config));
  if (result?.error === ErrorType.InvalidToken) {
    console.log('Error occurs, ', store.getToken());
    await auth({ interactive: false });
    console.log('auth interactive false, ', store.getToken());
    setHeaderAuth(config);
    return await fetchDriveApi(axios(config));
  } else {
    return result;
  }
}

function setHeaderAuth(config: AxiosRequestConfig) {
  const authValue = `Bearer ${store.getToken()}`;

  if (config?.headers) {
    config.headers.Authorization = authValue;
  } else {
    config.headers = {
      Authorization: authValue,
    };
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
        } else if (errorData?.error) {
          resolve(errorData?.error);
        } else {
          resolve(null);
        }
      });
  });
}

function isString(data: any) {
  return Object.prototype.toString.call(data) === '[object String]';
}
