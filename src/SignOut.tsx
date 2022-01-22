import React, { FC, useState } from 'react';

import { Grid } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import LoadingButton from '@mui/lab/LoadingButton';

import { SignOutProps } from './interfaces';

const SignOut: FC<SignOutProps> = ({ loading, signOut }) => {
  return (
    <Grid item xs={6} marginTop={2}>
      <LoadingButton
        color="error"
        loading={loading}
        loadingPosition="start"
        variant="outlined"
        startIcon={<LogoutIcon />}
        onClick={signOut}
      >
        Sign Out
      </LoadingButton>
    </Grid>
  );
};

export default SignOut;
