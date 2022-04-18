import { auth } from '../utils/authUtils';
import { backup, generateFilename } from '../utils/backupUtils';
import { getLocalBrowserStorage } from '../utils/browserUtils';
import { getMonthDiffMoment, wait } from '../utils/timeUtils';

init();

const MINUTES_IN_MILLISECONDS = 60 * 1000;

function init() {
  setInterval(updateTokenSilently, MINUTES_IN_MILLISECONDS);
}

async function updateTokenSilently() {
  const lastUpdated = (await getLocalBrowserStorage('tokenLastUpdated'))
    ?.tokenLastUpdated;

  console.log(
    '🚀 ~ file: background.ts ~ line 17 ~ updateTokenSilently ~ lastUpdated',
    lastUpdated
  );

  if (!lastUpdated) {
    return;
  }

  if (
    new Date().getTime() - parseInt(lastUpdated) >
    57 * MINUTES_IN_MILLISECONDS
  ) {
    console.log('Fire!');
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
  console.log('Backuped!');
}
