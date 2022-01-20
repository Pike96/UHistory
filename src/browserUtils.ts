export function setLocalBrowserStorage(entry: object) {
  return new Promise<void>((resolve) => {
    chrome.storage.local.set(entry, resolve);
  });
}

export function getLocalBrowserStorage(entry: object) {
  return new Promise<void>((resolve) => {
    chrome.storage.local.get(entry, (result: any) => {
      resolve(result);
    });
  });
}
