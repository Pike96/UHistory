import React, { FC, useState } from 'react';

import { Backdrop, Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';

const PopupOptions: FC<any> = ({ updateFolderName, updateTag }) => {
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
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
      <Backdrop
        open={open}
        onClick={handleClose}
      ></Backdrop>
    </>
  );
};

export default PopupOptions;
