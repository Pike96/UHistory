import React, { FC, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import { Grid } from '@mui/material';
import CloudIcon from '@mui/icons-material/Cloud';
import LoadingButton from '@mui/lab/LoadingButton';

import { auth } from './authUtils';
import { AuthViewProps } from './interfaces';

const AuthView: FC<AuthViewProps> = ({ notify, setToken }) => {
  const [loading, setLoading] = useState(false);

  const handleAuthClick = async (): Promise<void> => {
    setLoading(true);
    const token = await auth({ interactive: true });
    setLoading(false);

    if (token) {
      setToken(token);
      notify({
        message: 'CLOSE_NOTI',
        severity: 'success',
      });
    } else {
      notify({
        message:
          "We can't sign in to your drive. You may have cancelled it. Please try again later.",
        severity: 'error',
      });
    }
  };

  return (
    <Grid item xs={12}>
      <LoadingButton
        startIcon={<CloudIcon />}
        loading={loading}
        loadingPosition="start"
        onClick={handleAuthClick}
        variant="contained"
      >
        Sign In To Your Google Drive
      </LoadingButton>
    </Grid>
  );
};

export default AuthView;
