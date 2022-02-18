import React, { FC, useState } from 'react';

import { Tooltip } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import SettingsIcon from '@mui/icons-material/Settings';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { getLocalBrowserStorage } from './browserUtils';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const PopupOptions: FC<any> = ({
  folderName,
  updateFolderName,
  tag,
  updateTag,
  notify,
}) => {
  const [open, setOpen] = useState(false);
  const [tagInput, setTagInput] = useState(tag);
  const [folderNameInput, setFolderNameInput] = useState(folderName);

  const loadSettings = async () => {
    getLocalBrowserStorage('folderName').then((result) => {
      result?.folderName && setFolderNameInput(result?.folderName)
    });
    getLocalBrowserStorage('tag').then((result) => {
      result?.tag && setTagInput(result?.tag);
    });
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    loadSettings();
    setOpen(true);
  };
  const handleSave = () => {
    handleClose();
    updateTag(tagInput);
    updateFolderName(folderNameInput);
    notify({
      message: 'Options saved',
      severity: 'success',
    });
  };

  return (
    <>
      <Tooltip title="Options">
        <IconButton
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            '&:hover': { transform: 'rotate(60deg)', transition: 'all .3s' },
          }}
          aria-label="Options"
          onClick={handleOpen}
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
              autoFocus
            >
              <CloseIcon />
            </IconButton>

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
            onInput={(e) =>
              setTagInput((e.target as HTMLTextAreaElement).value)
            }
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
      </Dialog>
    </>
  );
};

export default PopupOptions;
