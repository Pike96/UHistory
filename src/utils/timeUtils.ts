import moment from 'moment';

export function getMonthName(_moment: moment.Moment): string | undefined {
  return _moment.format('MMM');
}

export function getYearName(_moment: moment.Moment): string | undefined {
  return _moment.format('YYYY');
}

export function getMonthDiffMoment(monthDiff: number): moment.Moment {
  return moment.utc().subtract(monthDiff, 'months');
}

export function wait(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function getDateFromDateString(timestamp: number) {
  return new Date(getDateStringFromTimestamp(timestamp));
}

export function getDateStringFromTimestamp(timestamp: number) {
  return getDateStringFromDate(new Date(timestamp));
}

export function getDateStringFromDate(date: Date) {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}
