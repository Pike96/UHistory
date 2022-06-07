import { readBrowserHistory } from '../utils/browserUtils';
import {
  createFolderInDrive,
  doesFileExistInDrive,
  getFolderIdFromDrive,
  saveHistoryFile,
} from '../utils/driveUtils';
import { getMonthName, getYearName } from './timeUtils';

export async function backup(
  folderName: string,
  fileName: string,
  monthDiffDate: Date,
  notify: Function
) {
  let folderId = await getFolderIdFromDrive(folderName);
  if (folderId && (await doesFileExistInDrive(fileName, folderId as string))) {
    notify({
      message: `Backup already exists: ${fileName}. No need to backup again.`,
      severity: 'info',
    });
  } else {
    folderId ||= await createFolderInDrive(folderName);
    const historyData = await readBrowserHistory(monthDiffDate);

    if (historyData?.length === 0) {
      notify({
        message: `No history found for the selected month`,
        severity: 'warning',
      });
    } else {
      const response = await saveHistoryFile(
        folderId as string,
        fileName,
        historyData
      );

      if (response === fileName) {
        notify({
          message: `Successfully backuped: ${fileName}`,
          severity: 'success',
        });
      } else {
        notify({
          message: response?.error || 'Unknown error. Please try again later',
          severity: 'error',
        });
      }
    }
  }
}

export function generateFilename(monthDiffDate: Date, tag: string) {
  return `UHB${getYearName(monthDiffDate)}${getMonthName(
    monthDiffDate
  )}${tag}.json`;
}
