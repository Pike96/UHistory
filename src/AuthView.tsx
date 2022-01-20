import React, { FunctionComponent, useState } from "react";
import ReactDOM from "react-dom";

import CloudIcon from "@mui/icons-material/Cloud";
import Grid from "@mui/material/Grid";
import LoadingButton from "@mui/lab/LoadingButton";

import { auth } from "./authUtils";

const AuthView: FunctionComponent<{ setAuthDone: Function }> = ({
  setAuthDone,
}) => {
  const [loading, setLoading] = useState(false);

  const handleAuthClick = async () => {
    setLoading(true);
    const token = await auth({ interactive: true });
    if (token) {
      setAuthDone(true);
    }
    else {
      // notification: Can't sign in to your Google Drive. Please try again later.
    }
    setLoading(false);
  };

  return (
    <LoadingButton
      startIcon={<CloudIcon />}
      loading={loading}
      loadingPosition="start"
      onClick={handleAuthClick}
      variant="contained"
    >
      Sign In To Your Google Drive
    </LoadingButton>
  );
};

export default AuthView;
