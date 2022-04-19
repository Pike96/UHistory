import React, { FC, useEffect, useState } from 'react';

import { Button, ButtonGroup, Grid, Typography } from '@mui/material';
import AddToDriveIcon from '@mui/icons-material/AddToDrive';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import LoadingButton from '@mui/lab/LoadingButton';

import { BackupViewProps, ErrorType } from '../common/interfaces';
import { cancelAuth } from '../utils/authUtils';

import SignOut from '../components/SignOut';
import { getMonthDiffMoment, getMonthName, wait } from '../utils/timeUtils';
import moment from 'moment';
import PopupOptions from '../components/PopupOptions';
import { useFolderName, useTag } from '../hooks/optionsHooks';
import { backup, generateFilename } from '../utils/backupUtils';

const BackupView: FC<BackupViewProps> = ({ notify, setToken }) => {
  const [loading, setLoading] = useState(false);
  const [monthDiff, setMonthDiff] = useState(1);
  const [monthDiffMoment, setMonthDiffMoment] = useState<moment.Moment>(
    getMonthDiffMoment(monthDiff)
  );
  const [fileName, setFileName] = useState('');
  const [folderName, updateFolderName] = useFolderName();
  const [tag, updateTag] = useTag();

  const updateFilename = () => {
    setFileName(generateFilename(monthDiffMoment, tag));
  };

  const updateMonthDiff = (_monthDiff: number) => {
    setMonthDiff(_monthDiff);
    setMonthDiffMoment(getMonthDiffMoment(_monthDiff));
  };

  const backupFile = async () => {
    try {
      await backup(folderName, fileName, monthDiffMoment, notify);
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
              {getMonthName(getMonthDiffMoment(_monthDiff))}
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
