'use strict';

// Load api.js script to use gapi (Failed to include in html)
load_script("https://apis.google.com/js/api.js");

function load_script(src){
  var script_url = document.createElement('script');
  script_url.src = src;
  script_url.async = true;
  script_url.defer = false;
  script_url.onload = handleClientLoad;
  document.head.appendChild(script_url);
}

function handleClientLoad() {
  // Load the API's client and auth2 modules.
  // Call the initClient function after the modules load.
  gapi.load('client:auth2',initClient);
}


function initClient() {
  // Initialize the gapi.client object, which app uses to make API requests.

  // Handle button click events (JQuery)
  $('#sign-in-or-out-button').click(function() {
    if (gapi.auth.getToken() == null) {
      signin();
    } else {
      signout();
    }
  });
  $('#backup-button').click(function () {
    checker(backupHelper);
  });

  // Sign in on load by default
  if (gapi.auth.getToken() == null) {
    signin();
    signinStatusListener();
  }

  // Start listener
  window.listen = setInterval(signinStatusListener, 600);
}

function signin() {
  chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
    if (token == null) {
      return;
    }
    gapi.auth.setToken({ 'access_token': token });
    gapi.client.load('drive', 'v3');
  });
}

function signout() {
    if (gapi.auth.getToken() == null) {
    return;
  }
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://accounts.google.com/o/oauth2/revoke?token=' +
    gapi.auth.getToken().access_token);
  xhr.send();

  var token = gapi.auth.getToken();
  chrome.identity.removeCachedAuthToken({ 'token': token.access_token });

  gapi.auth.setToken(null);
}

function signinStatusListener() {
  if (gapi.auth.getToken() != null) {
    $('#sign-in-or-out-button').html('Sign Out');
    $('#sign-in-or-out-button').css('display', 'inline-block');
    $('#sign-in-or-out-button').removeClass("btn-success");
    $('#sign-in-or-out-button').addClass("btn btn-danger");
    $('#backup-button').css('display', 'inline-block');
    $('#backup-button').className = '';
    $('#backup-button').addClass("btn btn-primary");
    $('#signin-status').html('Authorized / Signed in.');
    $('#signin-status').removeClass("alert-warning");
    $('#signin-status').addClass("alert alert-info");
  } else {
    $('#sign-in-or-out-button').html('Sign In / Authorize');
    $('#sign-in-or-out-button').css('display', 'inline-block');
    $('#sign-in-or-out-button').removeClass("btn-danger");
    $('#sign-in-or-out-button').addClass("btn btn-success");
    $('#backup-button').css('display', 'none');
    $('#signin-status').html('Unauthorized / Signed out.');
    $('#signin-status').removeClass("alert-info");
    $('#signin-status').addClass("alert alert-warning");
    $('#backup-status').css('display', 'none');
  }
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
    $('#backup-status').css('display', 'block');
    if (files && files.length > 0) {
      $('#backup-status').html("Backuped: " + fileName);
      $('#backup-status').removeClass("alert-secondary alert-danger");
      $('#backup-status').addClass("alert alert-success");
      return true;
    } else {
      if (!callback) {
        return false;
      }
      $('#backup-status').html('Backuping ...');
      $('#backup-status').removeClass("alert-danger alert-success");
      $('#backup-status').addClass("alert alert-secondary");
      callback();
      setTimeout(progressChecker, 6000);
      return false;
    }
  });
}

function progressChecker() {
  if (!checker()) {
    $('#backup-status').html('Backup failed!');
    $('#backup-status').removeClass("alert-secondary alert-success");
    $('#backup-status').addClass("alert alert-danger");
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
