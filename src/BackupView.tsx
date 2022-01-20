import React, { FunctionComponent, useState } from "react";
import ReactDOM from "react-dom";

import CloudIcon from "@mui/icons-material/Cloud";
import Grid from "@mui/material/Grid";
import LoadingButton from "@mui/lab/LoadingButton";

import { auth } from "./authUtils";

const BackupView: FunctionComponent<{ setAuthDone: Function }> = ({
  setAuthDone,
}) => {
  const [loading, setLoading] = useState(false);

  const handleAuthClick = async () => {
    await auth({ interactive: true });
    setAuthDone(true);
  };

  return (
    <LoadingButton
      startIcon={<CloudIcon />}
      loading={loading}
      loadingPosition="start"
      onClick={handleAuthClick}
      variant="contained"
    >
      Sign In To Your Google Drive 2
    </LoadingButton>
  );
};

export default BackupView;
