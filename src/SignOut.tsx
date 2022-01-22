import React, { FC, useState } from 'react';

import { Grid } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import LoadingButton from '@mui/lab/LoadingButton';

import { signOut } from './authUtils';
import { SignOutProps } from './interfaces';

const SignOut: FC<SignOutProps> = ({
  notify,
  setToken,
  loading,
  setLoading,
}) => {
  const handleSignOutClick = async (): Promise<void> => {
    setLoading(true);
    await signOut();
    setLoading(false);
    notify({
      message: 'Successfully signed out',
      severity: 'success',
    });
    setToken('');
  };

  return (
    <Grid item xs={6} marginTop={2}>
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

export default SignOut;
