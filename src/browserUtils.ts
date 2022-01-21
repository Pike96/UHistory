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
