import React, { FC, useEffect, useState } from 'react';

import AddToDriveIcon from '@mui/icons-material/AddToDrive';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import LoadingButton from '@mui/lab/LoadingButton';
import { Button, ButtonGroup, Grid, Typography } from '@mui/material';

import { BackupViewProps, ErrorType } from '../common/interfaces';
import PopupOptions from '../components/PopupOptions';
import SignOut from '../components/SignOut';
import { useFolderName, useTag } from '../hooks/optionsHooks';
import { cancelAuth } from '../utils/authUtils';
import { backup, generateFilename } from '../utils/backupUtils';
import { getMonthDiffDate, getMonthName, wait } from '../utils/timeUtils';

const BackupView: FC<BackupViewProps> = ({ notify, setToken }) => {
  const [loading, setLoading] = useState(false);
  const [monthDiff, setMonthDiff] = useState(1);
  const [monthDiffDate, setMonthDiffDate] = useState<Date>(
    getMonthDiffDate(monthDiff)
  );
  const [fileName, setFileName] = useState('');
  const [folderName, updateFolderName] = useFolderName();
  const [tag, updateTag] = useTag();

  const updateFilename = () => {
    setFileName(generateFilename(monthDiffDate, tag));
  };

  const updateMonthDiff = (_monthDiff: number) => {
    setMonthDiff(_monthDiff);
    setMonthDiffDate(getMonthDiffDate(_monthDiff));
  };

  const backupFile = async () => {
    try {
      await backup(folderName, fileName, monthDiffDate, notify);
    } catch (error: any) {
      if (error.message === ErrorType.InvalidToken) {
        await signOut(ErrorType.InvalidToken);
      } else {
        notify({
          message: error.message,
          severity: 'error',
        });
      }
    }
  };

  const signOut = async (message?: string): Promise<void> => {
    setLoading(true);
    await cancelAuth();
    setLoading(false);
    setToken('');
    if (message === ErrorType.InvalidToken) {
      notify({
        message: ErrorType.InvalidToken,
        severity: 'error',
      });
    } else {
      notify({
        message: 'Successfully signed out',
        severity: 'success',
      });
    }
  };

  useEffect(() => {
    updateFilename();
  }, [monthDiff, folderName, tag]);

  return (
    <>
      <Grid item xs={12}>
        <LoadingButton
          color="primary"
          loading={loading}
          loadingPosition="start"
          variant="contained"
          startIcon={<FileOpenIcon />}
          onClick={() => {
            window.open(chrome.runtime.getURL('reader.html'));
          }}
        >
          Read history from files
        </LoadingButton>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" component="h1">
          Backup File Location:
          <br />
          {folderName}/{fileName}
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body1" component="h1">
          Month to backup:
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <ButtonGroup variant="outlined" aria-label="outlined button group">
          {[3, 2, 1].map((_monthDiff) => (
            <Button
              key={_monthDiff}
              variant={monthDiff === _monthDiff ? 'contained' : undefined}
              onClick={() => updateMonthDiff(_monthDiff)}
            >
              {getMonthName(getMonthDiffDate(_monthDiff))}
            </Button>
          ))}
        </ButtonGroup>
      </Grid>
      <Grid item xs={6} marginTop={2}>
        <LoadingButton
          color="primary"
          loading={loading}
          loadingPosition="start"
          variant="contained"
          startIcon={<AddToDriveIcon />}
          onClick={async () => {
            setLoading(true);
            await Promise.all([backupFile(), wait(6_000)]);
            setLoading(false);
          }}
        >
          Backup
        </LoadingButton>
      </Grid>
      <SignOut loading={loading} signOut={signOut} />
      <PopupOptions
        folderName={folderName}
        updateFolderName={updateFolderName}
        tag={tag}
        updateTag={updateTag}
        notify={notify}
      />
    </>
  );
};

export default BackupView;
