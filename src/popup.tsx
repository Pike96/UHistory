import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

import CloudIcon from "@mui/icons-material/Cloud";
import Grid from "@mui/material/Grid";
import LoadingButton from "@mui/lab/LoadingButton";

import { auth } from "./authUtils";
import AuthView from "./AuthView";
import BackupView from "./BackupView";

const Popup = () => {
  const [authDone, setAuthDone] = useState(false);

  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
      width={430}
      minHeight={100}
    >
      {authDone ? (
        <BackupView setAuthDone={setAuthDone} />
      ) : (
        <AuthView setAuthDone={setAuthDone} />
      )}
    </Grid>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById("root")
);
