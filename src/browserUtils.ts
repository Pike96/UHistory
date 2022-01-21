export function setLocalBrowserStorage(entry: object): Promise<void> {
  return new Promise<void>((resolve) => {
    chrome.storage.local.set(entry, resolve);
  });
}

export function getLocalBrowserStorage(entry: object): Promise<void> {
  return new Promise<void>((resolve) => {
    chrome.storage.local.get(entry, (result: any) => {
      resolve(result);
    });
  });
}
