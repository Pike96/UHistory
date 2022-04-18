import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from '@emotion/react';
import theme from '../common/theme';
import CommonOptions from '../components/CommonOptions';
import { useFolderName, useTag } from '../hooks/optionsHooks';
import useNotification from '../hooks/useNotification';

const Options = () => {
  const [folderName, updateFolderName] = useFolderName();
  const [tag, updateTag] = useTag();
  const [, notify, NotificationWrapper] = useNotification();

  return (
    <ThemeProvider theme={theme}>
      <CommonOptions
        handleClose={null}
        tag={tag}
        updateTag={updateTag}
        folderName={folderName}
        updateFolderName={updateFolderName}
        notify={notify}
      />
      <NotificationWrapper />
    </ThemeProvider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>,
  document.getElementById('root')
);
