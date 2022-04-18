import { useState, useEffect } from 'react';
import * as store from '../common/store';
import { getLocalBrowserStorage } from '../utils/browserUtils';

function useToken(): [string, (state: string) => void] {
  const [token, setStateToken] = useState('');
  const setToken = (token: string) => {
    store.setToken(token);
    setStateToken(token);
  };

  useEffect(() => {
    if (token) return;

    getLocalBrowserStorage('accessToken').then(({ accessToken }) => {
      setToken(accessToken);
    });
  }, [token]);

  return [token, setToken];
}

export default useToken;
