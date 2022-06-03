import { auth } from '../utils/authUtils';
import { backup, generateFilename } from '../utils/backupUtils';
import { getLocalBrowserStorage } from '../utils/browserUtils';
import { getMonthDiffMoment, wait } from '../utils/timeUtils';

const MINUTE_IN_MILLISECONDS = 60 * 1000;

init();

function init() {
  updateTokenAndBackupSilently();
  setInterval(updateTokenAndBackupSilently, MINUTE_IN_MILLISECONDS);
}

async function updateTokenAndBackupSilently() {
  const lastUpdated = (await getLocalBrowserStorage('tokenLastUpdated'))
    ?.tokenLastUpdated;

  if (!lastUpdated) {
    return;
  }

  if (
    new Date().getTime() - parseInt(lastUpdated) >
    57 * MINUTE_IN_MILLISECONDS
  ) {
    await auth({ interactive: false });
    await wait(9000);
    backupLastMonthHistory();
  }
}

async function backupLastMonthHistory() {
  const folderName = (await getLocalBrowserStorage('folderName'))?.folderName;

  if (!folderName) {
    return;
  }

  const tag = (await getLocalBrowserStorage('tag'))?.tag;
  const monthDiffMoment = getMonthDiffMoment(1);
  const fileName = generateFilename(monthDiffMoment, tag);

  await backup(folderName, fileName, monthDiffMoment, () => {});
}
