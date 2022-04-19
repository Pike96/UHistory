import * as React from 'react';

import { Link } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import { getTimeFromTimeStamp } from '../utils/timeUtils';

const HistoryList = ({ dailyHistory }: any) => {
  const dataExists = dailyHistory && dailyHistory.length;

  return (
    <>
      {dataExists ? (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {dailyHistory.map((item: any, index: number) => (
            <ListItem
              key={index}
              alignItems="center"
              divider={index < dailyHistory.length - 1}
            >
              <Typography
                sx={{ marginInlineEnd: 2 }}
                variant="body2"
                color="text.primary"
              >
                {getTimeFromTimeStamp(item.lastVisitTime)}
              </Typography>
              <ListItemText
                sx={{ wordBreak: 'break-word' }}
                primary={item.title}
                secondary={
                  <>
                    <Link
                      variant="body2"
                      color="text.secondary"
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.url}
                    </Link>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography
          variant="h5"
          sx={{ width: '100%', bgcolor: 'background.paper' }}
        >
          No history record found for this day.
        </Typography>
      )}
    </>
  );
};

export default HistoryList;
