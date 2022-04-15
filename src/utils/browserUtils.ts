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
  monthDiffMoment: moment.Moment
): Promise<chrome.history.HistoryItem[]> {
  const query: chrome.history.HistoryQuery = {
    text: '',
    maxResults: 9_999_999,
    startTime: monthDiffMoment.startOf('month').valueOf(),
    endTime: monthDiffMoment.endOf('month').valueOf(),
  };

  return await getHistoryData(query);
}

function getHistoryData(query: chrome.history.HistoryQuery) {
  return new Promise<chrome.history.HistoryItem[]>((resolve) => {
    chrome.history.search(query, resolve);
  });
}
