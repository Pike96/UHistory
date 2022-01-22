import moment from 'moment';
import { resolveConfig } from 'prettier';

export function getMonthName(monthDiff: number): string {
  return moment().subtract(monthDiff, 'months').format('MMM');
}

export function getYearName(monthDiff: number): string {
  return moment().subtract(monthDiff, 'months').format('YYYY');
}

export function wait(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
