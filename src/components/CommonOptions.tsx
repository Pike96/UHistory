import React, { useEffect, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

const CommonOptions = ({
  handleClose,
  tag,
  updateTag,
  folderName,
  updateFolderName,
  notify,
}: any) => {
  const [tagInput, setTagInput] = useState(tag);
  const [folderNameInput, setFolderNameInput] = useState(folderName);

  const handleSave = () => {
    handleClose && handleClose();
    updateTag(tagInput);
    updateFolderName(folderNameInput);
    notify({
      message: 'Options saved',
      severity: 'success',
    });
  };

  useEffect(() => {
    setTagInput(tag);
    setFolderNameInput(folderName);
  }, [tag, folderName]);

  return (
    <>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          {handleClose && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
              autoFocus
            >
              <CloseIcon />
            </IconButton>
          )}

          <Typography sx={{ ml: 1, flex: 1 }} variant="h6" component="div">
            Options
          </Typography>

          <Button autoFocus color="inherit" onClick={handleSave}>
            Save
          </Button>
        </Toolbar>
      </AppBar>
      <Stack
        component="form"
        padding={2}
        spacing={3}
        noValidate
        autoComplete="off"
      >
        <TextField
          label="Tag"
          helperText="Tag is the suffix of the filename. It can help you save history for multiple devices."
          value={tagInput}
          onInput={(e) => setTagInput((e.target as HTMLTextAreaElement).value)}
        />
        <TextField
          label="Folder Name"
          helperText="Folder Name specifies where to save your history files. It can also help you save history for multiple devices."
          value={folderNameInput}
          onInput={(e) =>
            setFolderNameInput((e.target as HTMLTextAreaElement).value)
          }
        />
      </Stack>
    </>
  );
};

export default CommonOptions;
