import React, { FC, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import { Button, ButtonGroup, Grid, Typography } from '@mui/material';
import AddToDriveIcon from '@mui/icons-material/AddToDrive';
import LoadingButton from '@mui/lab/LoadingButton';

import { BackupViewProps, ErrorType } from './interfaces';
import { cancelAuth } from './authUtils';
import {
  createFolderInDrive,
  doesFileExistInDrive,
  getFolderIdFromDrive,
} from './driveUtils';
import SignOut from './SignOut';
import {
  getMonthDiffMoment,
  getMonthName,
  getYearName,
  wait,
} from './timeUtils';
import moment from 'moment';
import { readBrowserHistory } from './browserUtils';

const BackupView: FC<BackupViewProps> = ({ notify, setToken }) => {
  const [loading, setLoading] = useState(false);
  const [monthDiff, setMonthDiff] = useState(1);
  const [monthDiffMoment, setMonthDiffMoment] = useState<moment.Moment>(
    getMonthDiffMoment(monthDiff)
  );
  const [fileName, setFileName] = useState('');
  const [folderName, setFolderName] = useState('UHistoryBackup');
  const [tag, setTag] = useState('');

  const updateFilename = () => {
    setFileName(
      `UHB${getYearName(monthDiffMoment)}${getMonthName(
        monthDiffMoment
      )}${tag}.txt`
    );
  };

  const updateMonthDiff = (_monthDiff: number) => {
    setMonthDiff(_monthDiff);
    setMonthDiffMoment(getMonthDiffMoment(_monthDiff));
  };

  const backupFile = async () => {
    try {
      if (await doesFileExistInDrive(fileName)) {
        notify({
          message: `Backup already exists: ${fileName}. No need to backup again.`,
          severity: 'info',
        });
      } else {
        let folderId = await getFolderIdFromDrive(folderName);
        if (!folderId) {
          folderId = await createFolderInDrive(folderName);
        }
        const historyData = await readBrowserHistory(monthDiffMoment);

        if (historyData?.length === 0) {
          notify({
            message: `No history found for the selected month`,
            severity: 'warning',
          });
        }
        else {
          const seriralizedData = JSON.stringify(historyData);
          const deserializedData = JSON.parse(seriralizedData);
          console.log(deserializedData);
  
          notify({
            message: `Successfully backuped: ${fileName}.`,
            severity: 'success',
          });
        }
      }
    } catch (error: any) {
      if (error.message === ErrorType.InvalidToken) {
        await signOut("We can't backup right now. Please try to sign in again.");
      }
      else {
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
          Filename: {fileName}
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
