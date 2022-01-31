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
  saveHistoryFile,
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
      )}${tag}.json`
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
        } else {
          const response = await saveHistoryFile(
            folderId as string,
            fileName,
            historyData
          );

          if (response === fileName) {
            notify({
              message: `Successfully backuped: ${fileName}.`,
              severity: 'success',
            });
          } else {
            notify({
              message:
                response?.error || 'Unknown error. Please try again later',
              severity: 'error',
            });
          }
        }
      }
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

  const handleBackupClick = async () => {
    setLoading(true);
    await Promise.all([backupFile(), wait(6_000)]);
    setLoading(false);
  };

  useEffect(() => {
    updateFilename();
  }, [monthDiff, folderName, tag]);

  return (
    <>
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
