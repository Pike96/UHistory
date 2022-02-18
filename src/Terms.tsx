import React from 'react';
import Grid from '@mui/material/Grid';

import { Typography } from '@mui/material';
const Terms = () => {
  return (
    <Grid item xs={12}>
      <Typography variant="body1" component="p" fontSize={12} color={'#bbb'}>
        *Your data is secure. We can't see your history.
        <br />
        We have no server. The only website we connect for you is Google.
      </Typography>
    </Grid>
  );
};

export default Terms;
