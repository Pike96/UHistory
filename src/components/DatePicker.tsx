import React, { useState } from 'react';

import { Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  PickersDay,
  pickersDayClasses,
  PickersDayProps,
} from '@mui/x-date-pickers/PickersDay';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';

import { getDateStringFromDate } from '../utils/timeUtils';

type CustomPickerDayProps = PickersDayProps<Date> & {
  colorScale: number;
};

const HEATMAP_COLOR_SCALES = [
  '#ddd',
  '#9adcfb',
  '#35baf6',
  '#0276aa',
  '#003c6c',
];

const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) => prop !== 'colorScale',
})<CustomPickerDayProps>(
  ({ theme, selected, outsideCurrentMonth, colorScale }) => {
    const backgroundColor = HEATMAP_COLOR_SCALES[colorScale];
    return {
      ...(!outsideCurrentMonth && {
        backgroundColor,
        color: theme.palette.common.black,
        '&:hover, &:focus': {
          backgroundColor,
        },
      }),
      ...(colorScale > 2 && {
        color: theme.palette.common.white,
      }),
      [`&&.${pickersDayClasses.selected}`]: {
        backgroundColor,
        color: theme.palette.common.black,
        ...(colorScale > 2 && {
          color: theme.palette.common.white,
        }),
      },
      ...(!selected && {
        borderRadius: 0,
      }),
      [`&&.${pickersDayClasses.disabled}`]: {
        backgroundColor: theme.palette.common.white,
      },
    };
  }
) as React.ComponentType<CustomPickerDayProps>;

export default function DatePicker({ countsData, setDate }: any) {
  const [value, setValue] = useState<Date | null>(new Date());

  const setColorScale = (dateString: string, countsData: any) => {
    let colorScale = 0;
    const map = countsData.map;
    const scaleSize = HEATMAP_COLOR_SCALES.length;
    if (countsData.maxCount > 0 && map.has(dateString)) {
      const count = map.get(dateString);
      const interval = Math.ceil((countsData.maxCount + 1) / (scaleSize - 1));
      colorScale = Math.floor(count / interval) + 1;
    }
    return colorScale;
  };

  const getDayElement = (day: Date, pickersDayProps: PickersDayProps<Date>) => {
    const dateString = getDateStringFromDate(day);
    const colorScale = setColorScale(dateString, countsData);

    return (
      <Tooltip
        title={`${dateString} : ${countsData.map.get(dateString) || 0}`}
        placement="top"
        arrow
        followCursor
        key={pickersDayProps.key}
      >
        <span>
          <CustomPickersDay
            {...pickersDayProps}
            disableMargin
            colorScale={colorScale}
          />
        </span>
      </Tooltip>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <StaticDatePicker<Date>
        orientation="portrait"
        openTo="day"
        disableFuture
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          setDate(getDateStringFromDate(newValue));
        }}
        renderInput={(params) => <TextField {...params} />}
        renderDay={(day, _selectedDates, pickersDayProps) =>
          getDayElement(day, pickersDayProps)
        }
      />
    </LocalizationProvider>
  );
}
