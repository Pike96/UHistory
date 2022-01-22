import React, { FC, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import { Button, ButtonGroup, Grid, Typography } from '@mui/material';
import AddToDriveIcon from '@mui/icons-material/AddToDrive';
import LoadingButton from '@mui/lab/LoadingButton';

import { BackupViewProps } from './interfaces';
import { cancelAuth } from './authUtils';
import {
  createFolderInDrive,
  doesFileExistInDrive,
  getFolderIdFromDrive,
  listDriveFiles,
} from './fileUtils';
import SignOut from './SignOut';
import { getMonthName, getYearName, wait } from './timeUtils';

const BackupView: FC<BackupViewProps> = ({ notify, setToken }) => {
  const [loading, setLoading] = useState(false);
  const [monthDiff, setMonthDiff] = useState(1);
  const [fileName, setFileName] = useState('');
  const [folderName, setFolderName] = useState('UHistoryBackup');
  const [tag, setTag] = useState('');

  const updateFilename = () => {
    setFileName(
      `UHB${getYearName(monthDiff)}${getMonthName(monthDiff)}${tag}.txt`
    );
  };

  const backupFile = async () => {
    try {
      if (await doesFileExistInDrive(fileName)) {
        notify({
          message: `Backup already exists: ${fileName}. No need to backup again.`,
          severity: 'info',
        });
      } else {
        let folderId = await getFolderIdFromDrive(folderName)
        if (!folderId) {
          folderId = await createFolderInDrive();
        }
        console.log(folderId);
        notify({
          message: `Successfully backuped: ${fileName}.`,
          severity: 'success',
        });
      }
    } catch (e) {
      // await signOut('We can\'t backup right now. Please try to sign in again.');
    }
  };

  const signOut = async (message?: string): Promise<void> => {
    setLoading(true);
    await cancelAuth();
    setLoading(false);
    if (message) {
      notify({
        message,
        severity: 'error',
      });
    } else {
      notify({
        message: 'Successfully signed out',
        severity: 'success',
      });
    }
    setToken('');
  };

  const handleBackupClick = async () => {
    setLoading(true);
    await Promise.all([backupFile(), wait(6_000)]);
    setLoading(false);
  };

  useEffect(() => {
    updateFilename();
  }, [monthDiff, tag]);

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="body1" component="h1">
          Tag: {fileName}
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
              onClick={() => setMonthDiff(_monthDiff)}
            >
              {getMonthName(_monthDiff)}
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
          onClick={handleBackupClick}
        >
          Backup
        </LoadingButton>
      </Grid>
      <SignOut loading={loading} signOut={signOut} />
    </>
  );
};

export default BackupView;
