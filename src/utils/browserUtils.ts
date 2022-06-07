export function getLocalBrowserStorage(
  keys: string | string[] | { [key: string]: any } | null
): Promise<any> {
  return new Promise<any>((resolve) => {
    chrome.storage.local.get(keys, (result: any) => {
      resolve(result);
    });
  });
}

export function setLocalBrowserStorage(items: {
  [key: string]: any;
}): Promise<void> {
  return new Promise<void>((resolve) => {
    chrome.storage.local.set(items, resolve);
  });
}

export function removeCachedAuthToken(token: string): Promise<void> {
  return new Promise<void>((resolve) => {
    chrome.identity.removeCachedAuthToken({ token }, resolve);
  });
}

export async function readBrowserHistory(
  monthDiffDate: Date
): Promise<chrome.history.HistoryItem[]> {
  const startTime = new Date(monthDiffDate);
  startTime.setDate(1);
  startTime.setHours(0, 0, 0, 0);

  const endTime = new Date(monthDiffDate);
  endTime.setMonth(endTime.getMonth() + 1);
  endTime.setDate(1);
  endTime.setHours(0, 0, 0, 0);

  const query: chrome.history.HistoryQuery = {
    text: '',
    maxResults: 9_999_999,
    startTime: startTime.getTime(),
    endTime: endTime.getTime(),
  };

  return await getHistoryData(query);
}

function getHistoryData(query: chrome.history.HistoryQuery) {
  return new Promise<chrome.history.HistoryItem[]>((resolve) => {
    chrome.history.search(query, resolve);
  });
}
