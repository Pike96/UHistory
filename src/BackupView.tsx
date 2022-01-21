import React, { FC, useState } from 'react';
import ReactDOM from 'react-dom';

import { Grid } from '@mui/material';
import CloudIcon from '@mui/icons-material/Cloud';
import LoadingButton from '@mui/lab/LoadingButton';

import { signOut } from './authUtils';
import { BackupViewProps } from './interfaces';

const BackupView: FC<BackupViewProps> = ({ setAuthDone, notify }) => {
  const [loading, setLoading] = useState(false);

  const handleSignOutClick = async (): Promise<void> => {
    setLoading(true);

    await signOut();

    setLoading(false);
  };

  return (
    <Grid item xs={12}>
      <LoadingButton
        startIcon={<CloudIcon />}
        loading={loading}
        loadingPosition="start"
        onClick={handleSignOutClick}
        variant="contained"
      >
        Sign In To Your Google Drive
      </LoadingButton>
    </Grid>
  );
};

export default BackupView;
