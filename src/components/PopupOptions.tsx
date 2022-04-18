import React, { FC, useState } from 'react';

import { Tooltip } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import SettingsIcon from '@mui/icons-material/Settings';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import IconButton from '@mui/material/IconButton';
import CommonOptions from './CommonOptions';

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
          onClick={() => setOpen(true)}
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>
      <Dialog
        fullScreen
        open={open}
        onClose={() => setOpen(false)}
        TransitionComponent={Transition}
      >
        <CommonOptions
          handleClose={() => setOpen(false)}
          tag={tag}
          updateTag={updateTag}
          folderName={folderName}
          updateFolderName={updateFolderName}
          notify={notify}
        />
      </Dialog>
    </>
  );
};

export default PopupOptions;
