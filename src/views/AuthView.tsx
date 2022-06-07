import React, { FC, useState } from 'react';

import CloudIcon from '@mui/icons-material/Cloud';
import LoadingButton from '@mui/lab/LoadingButton';
import { Grid } from '@mui/material';

import { AuthViewProps, ErrorType, SpecialMessage } from '../common/interfaces';
import { auth } from '../utils/authUtils';

const AuthView: FC<AuthViewProps> = ({ notify, setToken }) => {
  const [loading, setLoading] = useState(false);

  const handleErrorMessage = (message: string | undefined) => {
    if (message?.includes('The user did not approve access')) {
      return ErrorType.UserNotApprove;
    }
    return message || ErrorType.UnknownSignInFailed;
  };

  const handleAuthClick = async (): Promise<void> => {
    setLoading(true);
    const { token, error } = await auth({ interactive: true });
    setLoading(false);

    if (token) {
      setToken(token);
      notify({
        message: SpecialMessage.ForceClose,
        severity: 'success',
      });
    } else {
      notify({
        message: handleErrorMessage(error),
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
