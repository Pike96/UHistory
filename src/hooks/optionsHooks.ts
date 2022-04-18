import { useState, useEffect } from 'react';
import {
  getLocalBrowserStorage,
  setLocalBrowserStorage,
} from '../utils/browserUtils';

export function useFolderName(): [string, Function] {
  const [folderName, setFolderName] = useState('UHistoryBackup');
  const updateFolderName = async (_folderName: string) => {
    setFolderName(_folderName);
    await setLocalBrowserStorage({ folderName: _folderName });
  };

  useEffect(() => {
    getLocalBrowserStorage('folderName').then((result) => {
      result?.folderName == undefined
        ? updateFolderName('UHistoryBackup')
        : setFolderName(result?.folderName);
    });
  }, []);

  return [folderName, updateFolderName];
}

export function useTag(): [string, Function] {
  const [tag, setTag] = useState('');
  const updateTag = async (_tag: string) => {
    setTag(_tag);
    await setLocalBrowserStorage({ tag: _tag });
  };

  useEffect(() => {
    getLocalBrowserStorage('tag').then((result) => {
      result?.tag === undefined ? updateTag('') : setTag(result?.tag);
    });
  }, []);

  return [tag, updateTag];
}
