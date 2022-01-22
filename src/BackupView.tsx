import React, { FC, useState } from 'react';
import ReactDOM from 'react-dom';

import { Button, ButtonGroup, Grid, Typography } from '@mui/material';
import AddToDriveIcon from '@mui/icons-material/AddToDrive';
import LoadingButton from '@mui/lab/LoadingButton';
import moment from 'moment';

import { BackupViewProps } from './interfaces';
import { driveFilesList } from './fileUtils';
import SignOut from './SignOut';

const BackupView: FC<BackupViewProps> = ({ notify, setToken }) => {
  const [loading, setLoading] = useState(false);
  const [monthDiff, setMonthDiff] = useState(3);
  const [filename, setFilename] = useState('');

  const handleBackupClick = async () => {
    setLoading(true);
    const result = await driveFilesList(
      "mimeType = 'application/vnd.google-apps.folder' and name = 'UHistoryBackup'"
    );
    setLoading(false);
    console.log(result);
    notify({
      message: 'Successfully backuped',
      severity: 'success',
    });
  };

  const getMonthName = (monthDiff: number): string => {
    return moment().subtract(monthDiff, 'months').format('MMM');
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="body1" component="h1">
          Tag:
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
      <SignOut
        notify={notify}
        setToken={setToken}
        loading={loading}
        setLoading={setLoading}
      />
    </>
  );
};

export default BackupView;
