import React, { FC, useState } from 'react';
import ReactDOM from 'react-dom';

import { Grid } from '@mui/material';
import CloudIcon from '@mui/icons-material/Cloud';
import LoadingButton from '@mui/lab/LoadingButton';

import { auth } from './authUtils';
import { AuthViewProps } from './interfaces';

const AuthView: FC<AuthViewProps> = ({ setAuthDone, notify }) => {
  const [loading, setLoading] = useState(false);

  const handleAuthClick = async (): Promise<void> => {
    setLoading(true);

    if (await auth({ interactive: true })) {
      setAuthDone(true);
    } else {
      notify({
        message: "Can't sign in to your Google Drive. Please try again later.",
        severity: 'error',
      });
    }

    setLoading(false);
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
