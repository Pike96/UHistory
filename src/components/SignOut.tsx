import React, { FC } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Grid,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import LoadingButton from '@mui/lab/LoadingButton';

import { SignOutProps } from '../common/interfaces';

const SignOut: FC<SignOutProps> = ({ loading, signOut }) => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Grid item xs={6} marginTop={2}>
      <LoadingButton
        color="error"
        loading={loading}
        loadingPosition="start"
        variant="outlined"
        startIcon={<LogoutIcon />}
        onClick={handleClickOpen}
      >
        Sign Out
      </LoadingButton>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {'Are you sure you want to sign out?'}
        </DialogTitle>

        <DialogActions>
          <Button onClick={signOut}>Yes</Button>
          <Button onClick={handleClose} autoFocus>
            No
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default SignOut;
