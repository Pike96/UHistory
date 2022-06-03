import { ErrorMessage, ErrorType, FolderMetadata } from '../common/interfaces';
import * as store from '../common/store';
import { auth } from './authUtils';
import { getDateStringFromTimestamp, wait } from './timeUtils';

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
  let maxCount = -1;
  const historyMap = new Map();
  for (const file of files) {
    for (const item of await getFileData(file.id)) {
      if (!item?.lastVisitTime) {
        break;
      }
      const date = getDateStringFromTimestamp(item.lastVisitTime);
      const newCount = (countMap.has(date) ? countMap.get(date) : 0) + 1;
      maxCount = Math.max(maxCount, newCount);
      countMap.set(date, newCount);
      historyMap.set(
        date,
        historyMap.has(date) ? [...historyMap.get(date), item] : [item]
      );
    }
  }
  return {
    countsData: {
      map: countMap,
      maxCount,
    },
    historyMap: sortHistoryMap(historyMap),
  };
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
  return await fetchDriveApiRetryAuth(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      method: 'get',
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
    }
  );
}

async function listDriveFiles(q: string) {
  const params = {
    q,
    fields: 'nextPageToken, files(id, name)',
  };

  return await fetchDriveApiRetryAuth(
    `https://www.googleapis.com/drive/v3/files?${new URLSearchParams(params)}`,
    {
      method: 'get',
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
    }
  );
}

async function createDriveFiles(folderMetadata: FolderMetadata) {
  return await fetchDriveApiRetryAuth(
    'https://www.googleapis.com/drive/v3/files',
    {
      method: 'post',
      body: folderMetadata as unknown as BodyInit,
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
    }
  );
}

async function uploadDriveFile(body: FormData) {
  return await fetchDriveApiRetryAuth(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'post',
      body,
    }
  );
}

async function fetchDriveApiRetryAuth(url: RequestInfo, config: RequestInit) {
  setHeaderAuth(config);
  const result = await fetchDriveApi(fetch(url, config));
  if (result?.error === ErrorType.InvalidToken) {
    console.log('Error occurs, ', store.getToken());
    await auth({ interactive: false });
    await wait(900);
    console.log('auth interactive false, ', store.getToken());
    setHeaderAuth(config);
    return await fetchDriveApi(fetch(url, config));
  } else {
    return result;
  }
}

function setHeaderAuth(config: any) {
  const authValue = `Bearer ${store.getToken()}`;

  if (config?.headers) {
    config.headers.set('Authorization', authValue);
  } else {
    config.headers = new Headers({
      Authorization: authValue,
    });
  }
}

async function fetchDriveApi(fetchPromise: Promise<Response>) {
  return new Promise<any | ErrorMessage>((resolve) => {
    fetchPromise
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
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

function sortHistoryMap(map: Map<string, any>) {
  const newMap = new Map();
  for (const [date, historyItems] of map.entries()) {
    newMap.set(
      date,
      historyItems.sort((a: any, b: any) => a.lastVisitTime - b.lastVisitTime)
    );
  }
  return newMap;
}
