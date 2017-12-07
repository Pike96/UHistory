'use strict';

var CLIENT_ID = "445850840649-dtoda6de4ahk9l7ggo1d8usqa28bs3us.apps.googleusercontent.com";
var SCOPES = "https://www.googleapis.com/auth/drive.file";

// Load api.js script to use gapi (Failed to include in html)
load_script("https://apis.google.com/js/client.js");

function load_script(src){
  var script_url = document.createElement('script');
  script_url.src = src;
  script_url.async = true;
  script_url.defer = false;
  script_url.onload = handleClientLoad;
  document.head.appendChild(script_url);
}

var firstAuth = setInterval(refreshToken, 1000);
var autoAuth = setInterval(refreshToken, 1800000); // 30 min

function refreshToken() {
  if (typeof gapi === 'undefined') {
    return;
  }
  clearInterval(firstAuth);
  gapi.auth.authorize({'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': true});
  gapi.client.load('drive', 'v3').then(function() {
    handleClientLoad();
    checker(backupHelper);
  });
}

function handleClientLoad() {
  // Load the API's client and auth2 modules.
  // Call the initClient function after the modules load.
  gapi.load('client:auth2');
}

function checker(callback) {
  var currentTime = new Date();
  var fileName = "UHB" +
    currentTime.getFullYear() + currentTime.getMonth() + ".csv";

  gapi.client.drive.files.list({
    'q': "trashed = false and name = '" + fileName + "'",
    'fields': "nextPageToken, files(id, name)"
  }).then(function (response) {
    var files = response.result.files;
    if (files && files.length > 0) {
      document.write("Backuped: " + fileName);
      return true;
    } else {
      if (!callback) {
        return false;
      }
      document.write("Backuping ...");
      callback();
      setTimeout(progressChecker, 3000);
      return false;
    }
  });
}

function progressChecker() {
  if (!checker()) {
    document.write("Backup failed!");
  }
}

function backupHelper() {
  // Find UHistoryBackup folder
  gapi.client.drive.files.list({
    'q': "mimeType = 'application/vnd.google-apps.folder' and name = 'UHistoryBackup'",
    'fields': "nextPageToken, files(id, name)"
  }).then(function (response) {
    var files = response.result.files;
    if (files && files.length > 0) {    // Folder found: Save
      historyReader(files[0].id, saveToFolder);
    } else {                            // Folder not found: Create folder
      var folderMetadata = {
        'name': 'UHistoryBackup',
        'mimeType': 'application/vnd.google-apps.folder'
      };
      gapi.client.drive.files.create({
        resource: folderMetadata,
      }).then(function (response) {
        switch (response.status) {
          case 200:
            var file = response.result;
            historyReader(file.id, saveToFolder);
            break;
          default:
            console.log('Error creating the folder, ' + response);
            break;
        }
      });
    }
  });
}

function saveToFolder(fileData, folderID, callback) {
  const boundary = '(/= _ =)/~';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  var currentTime = new Date();
  var fileName = "UHB" + currentTime.getFullYear() + currentTime.getMonth() + ".csv";

  var reader = new FileReader();
  reader.readAsBinaryString(fileData);
  reader.onload = function(e) {
    var contentType = fileData.type;
    var metadata = {
      'name': fileName,
      'mimeType': contentType,
      'parents': [folderID]
    };

    var base64Data = btoa(reader.result);
    var multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: ' + contentType + '\r\n' +
      'Content-Transfer-Encoding: base64\r\n' +
      '\r\n' +
      base64Data +
      close_delim;

    var request = gapi.client.request({
      'path': '/upload/drive/v3/files',
      'method': 'POST',
      'params': {'uploadType': 'multipart'},
      'headers': {
        'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
      },
      'body': multipartRequestBody});
    if (!callback) {
      callback = function(file) {
        console.log(file)
      };
    }
    request.execute(callback);
  }
}

function historyReader(folderID, callback) {
  var currentTime = new Date();
  var timeStartEnd = getLastMonthPeriod(currentTime);
  chrome.history.search({
    'text': '',
    'maxResults': 9999999,
    'startTime': timeStartEnd[0].getTime(),
    'endTime': timeStartEnd[1].getTime()
  }, function (res) {
    window.res = res;

    // header row
    var keys = Object.keys(res[0]);
    append(keys.join(","));

    var row;
    for (var i = 0; i < res.length; i++) {
      row = "";
      for (var j = 0; j < keys.length; j++) {
        row += JSON.stringify(res[i][keys[j]]);
        if (j !== keys.length - 1) row += ",";
      }
      append("\n" + row);
    }

    var blob = new Blob([data.innerText], {type: 'application/octet-stream'});
    callback(blob, folderID);
  });
}

function append(text) {
  data.appendChild(document.createTextNode(text));
}

document.addEventListener('DOMContentLoaded', function () {
  window.data = document.getElementById('data');
});


function getLastMonthPeriod(time) {
  var arr = new Array();
  var start =  new Date(time.getTime());
  start.setMonth(start.getMonth() - 1);
  start.setDate(1);
  start.setHours(0);
  start.setMinutes(0);
  start.setSeconds(0);
  start.setMilliseconds(0);
  var end = new Date(start.getTime());
  end.setMonth(end.getMonth()+1);
  arr.push(new Date(start.getTime()));
  arr.push(new Date(end.getTime()));
  return arr;
}

