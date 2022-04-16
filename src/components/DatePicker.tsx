import React, { useState } from 'react';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import {
  PickersDay,
  PickersDayProps,
  pickersDayClasses,
} from '@mui/x-date-pickers/PickersDay';
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
  ({ theme, selected, outsideCurrentMonth, colorScale }) => ({
    ...(!outsideCurrentMonth && {
      backgroundColor: HEATMAP_COLOR_SCALES[colorScale],
      color: theme.palette.common.white,
      '&:hover, &:focus': {
        backgroundColor: HEATMAP_COLOR_SCALES[colorScale],
        borderRadius: 20,
      },
    }),
    [`&&.${pickersDayClasses.selected}`]: {
      backgroundColor: HEATMAP_COLOR_SCALES[colorScale],
    },
    ...(!selected && {
      borderRadius: 0,
    }),
  })
) as React.ComponentType<CustomPickerDayProps>;

export default function DatePicker({ countsData, setDate }: any) {
  const [value, setValue] = useState<Date | null>(new Date());

  const setColorScale = (day: Date, countsData: any) => {
    let colorScale = 0;
    const map = countsData.map;
    const key = getDateStringFromDate(day);
    const scaleSize = HEATMAP_COLOR_SCALES.length;
    if (countsData.maxCount > 0 && map.has(key)) {
      const count = map.get(key);
      const interval = Math.ceil((countsData.maxCount + 1) / (scaleSize - 1));
      colorScale = Math.floor(count / interval) + 1;
    }
    return colorScale;
  };

  const getDayElement = (day: Date, pickersDayProps: PickersDayProps<Date>) => {
    const colorScale = setColorScale(day, countsData);

    return (
      <CustomPickersDay
        {...pickersDayProps}
        disableMargin
        colorScale={colorScale}
      />
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <StaticDatePicker<Date>
        orientation="portrait"
        openTo="day"
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          setDate(newValue);
        }}
        renderInput={(params) => <TextField {...params} />}
        renderDay={(day, _selectedDates, pickersDayProps) =>
          getDayElement(day, pickersDayProps)
        }
      />
    </LocalizationProvider>
  );
}
