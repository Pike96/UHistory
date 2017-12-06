'use strict';

var CLIENT_ID = '445850840649-dtoda6de4ahk9l7ggo1d8usqa28bs3us.apps.googleusercontent.com';
var SCOPES = 'https://www.googleapis.com/auth/drive.file';

function handleClientLoad() {
  // Load the API's client and auth2 modules.
  // Call the initClient function after the modules load.
  gapi.load('client:auth2', initClient);
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
  $('#save-temp').click(function () {
    saveTemp();
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

// function refreshToken() {
//   gapi.auth.authorize({'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': true});
// }

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
    $('#sign-in-or-out-button').html('Sign out');
    $('#sign-in-or-out-button').css('display', 'inline-block');
    $('#save-temp').css('display', 'inline-block');
    $('#auth-status').html('You are currently signed in and have granted ' +
      'access to this app.');
  } else {
    $('#sign-in-or-out-button').html('Sign In / Authorize');
    $('#sign-in-or-out-button').css('display', 'inline-block');
    $('#save-temp').css('display', 'none');
    $('#auth-status').html('You have not authorized this app or you are ' +
      'signed out.');
  }
}

function saveTemp() {
  // Find UHistoryBackup folder
  gapi.client.drive.files.list({
    'q': "mimeType = 'application/vnd.google-apps.folder' and name = 'UHistoryBackup'",
    'fields': "nextPageToken, files(id, name)"
  }).then(function (response) {
    var files = response.result.files;
    if (files && files.length > 0) {    // Folder found: Save
      historyReader(files[0].id, saveToFolder);
    } else {                            // Folder not found: Create folder
      console.log("Folder not found");
      var folderMetadata = {
        'name' : 'UHistoryBackup',
        'mimeType' : 'application/vnd.google-apps.folder'
      };
      gapi.client.drive.files.create({
        resource: folderMetadata,
      }).then(function(response) {
        switch(response.status){
          case 200:
            var file = response.result;
            historyReader(file.id, saveToFolder);
            break;
          default:
            console.log('Error creating the folder, '+response);
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

  var reader = new FileReader();
  console.log(fileData);
  reader.readAsBinaryString(fileData);
  reader.onload = function(e) {
    var contentType = fileData.type || 'application/octet-stream';
    var metadata = {
      'title': "testName.csv",
      'mimeType': contentType
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
      'path': '/upload/drive/v2/files',
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
  chrome.history.search({
    'text': '',
    'maxResults': 100,
    'startTime': 0
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

    var bblob = new Blob([data.innerText], {type: 'application/octet-binary'});
    callback(bblob, folderID);
  });
}

function append(text) {
  data.appendChild(document.createTextNode(text));
}

document.addEventListener('DOMContentLoaded', function () {
  window.data = document.getElementById('data');
});

// Load api.js script to use gapi (Failed to include in html)
load_script("https://apis.google.com/js/api.js");

function load_script(src){
  var script_url = document.createElement('script');
  script_url.src = src;
  script_url.async = true;
  script_url.defer = true;
  script_url.onload = handleClientLoad;
  document.head.appendChild(script_url);
}

