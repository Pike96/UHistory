# U History (Chrome Extension)

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FPike96%2FUHistory.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FPike96%2FUHistory?ref=badge_shield)

![tile1400](https://github.com/Pike96/UHistory/raw/master/pic/tile1400.png) [![](/pic/chrome-web-store.png "U History - Chrome Web Store")][webstore] <-- Click to get it

U means Unlimited! Chrome only saves 90 days of history. Use this extension and save your history on Google Drive forever!

### Features

- Backup selected month browsing history to your Google Drive.

- Automatically backup last month history in background once authorized.

- Read saved history on Goolge Drive (UI from [iBROWSE]).

- Only 1 PC backup every month. Use custom filename on other PCs. Sign out on unwanted PCs.

### WARNINGS

- Don't search "\`|\`|" or "|@|@" on your chrome! Please delete corresponding local history items and the backup in your drive then manually backup again if you did.

- Please close the popup every time the backup is done to make sure that backup succeeds.

## Log

- 180216 - Fix no file bug.

- 180113 - Add custom filename. Catch error of invalid file when reading

- 180101 - Fix incorrect filename

- 171231 - Fix problem of month with 31 days. Remove 90 days restriction in reading

- 171216 - Can read backuped history (using iBROWSE UI)

- 171215 - Select month to backup. Fix backup status bug.

- 171208 - Fix client id bug and others for chrome web store

- 171208 - Add icons, Modify name

- 171207 - Use AngularJS and NodeJS (gulp)

- 171207 - Can background backup

- 171206 - Can save last month history into 'UHistoryBackup' folder

- 171205 - Can save history into **`UHistoryBackup`** folder (cannot select date)

- 171205 - Can authorize

- 171130 - Init

--------------------------------
[webstore]:https://chrome.google.com/webstore/detail/u-history/nkokmdpokpgocgabofnpkandjgchljgf
[iBROWSE]:https://github.com/henrilouis/ibrowse
