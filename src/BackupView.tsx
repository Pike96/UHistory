import React, { FC, useState } from 'react';
import ReactDOM from 'react-dom';

import { Grid } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import LoadingButton from '@mui/lab/LoadingButton';

import { signOutForToken } from './authUtils';
import { BackupViewProps } from './interfaces';

const BackupView: FC<BackupViewProps> = ({ notify, token, setToken }) => {
  const [loading, setLoading] = useState(false);

  const handleSignOutClick = async (): Promise<void> => {
    setLoading(true);
    await signOutForToken(token);
    setLoading(false);
    notify({
      message: 'Successfully signed out',
      severity: 'success',
    });
    setToken('');
  };

  return (
    <Grid item xs={12}>
      <LoadingButton
        color="error"
        loading={loading}
        loadingPosition="start"
        variant="outlined"
        startIcon={<LogoutIcon />}
        onClick={handleSignOutClick}
      >
        Sign Out
      </LoadingButton>
    </Grid>
  );
};

export default BackupView;
