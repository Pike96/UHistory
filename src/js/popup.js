'use strict';

var popupMod = angular.module('UHistoryPopup', []);
popupMod.config(function ($compileProvider) {
  // url whitelist
  $compileProvider.aHrefSanitizationWhitelist (/^\s*(https?|ftp|file|chrome-extension):/);
});

popupMod.controller('PopupCtrl', ['$scope', '$window', '$filter', '$interval', function PopupCtrl($scope, $window, $filter, $interval) {
  $scope.authButtonHandler = function () {
    if (gapi.auth.getToken() == null) {
      signin();
    } else {
      signout();
    }
  }

  $scope.backupButtonHandler = function () {
    $scope.checker($scope.backupHelper);
  }


  $scope.checker = function (callback) {
    var currentTime = new Date();
    var fileName = "UHB" +
      currentTime.getFullYear() + currentTime.getMonth() + ".csv";

    gapi.client.drive.files.list({
      'q': "trashed = false and name = '" + fileName + "'",
      'fields': "nextPageToken, files(id, name)"
    }).then(function (response) {
      var files = response.result.files;
      angular.element($('#backup-status')).css('display', 'block');
      if (files && files.length > 0) {
        angular.element($('#backup-status')).html("Backuped: " + fileName);
        angular.element($('#backup-status')).removeClass("alert-secondary alert-danger");
        angular.element($('#backup-status')).addClass("alert alert-success");
        return true;
      } else {
        if (!callback) {
          return false;
        }
        angular.element($('#backup-status')).html('Backuping ...');
        angular.element($('#backup-status')).removeClass("alert-danger alert-success");
        angular.element($('#backup-status')).addClass("alert alert-secondary");
        callback();
        setTimeout($scope.progressChecker, 6000);
        return false;
      }
    });
  }

  $scope.progressChecker = function () {
    if (!$scope.checker()) {
      angular.element($('#backup-status')).html('Backup failed!');
      angular.element($('#backup-status')).removeClass("alert-secondary alert-success");
      angular.element($('#backup-status')).addClass("alert alert-danger");
    }
  }

  $scope.backupHelper = function () {
    // Find UHistoryBackup folder
    gapi.client.drive.files.list({
      'q': "mimeType = 'application/vnd.google-apps.folder' and name = 'UHistoryBackup'",
      'fields': "nextPageToken, files(id, name)"
    }).then(function (response) {
      var files = response.result.files;
      if (files && files.length > 0) {    // Folder found: Save
        $scope.historyReader(files[0].id, $scope.saveToFolder);
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
              $scope.historyReader(file.id, $scope.saveToFolder);
              break;
            default:
              console.log('Error creating the folder, ' + response);
              break;
          }
        });
      }
    });
  }

  $scope.saveToFolder = function (fileData, folderID, callback) {
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

  $scope.historyReader = function (folderID, callback) {
    var currentTime = new Date();
    var timeStartEnd = $scope.getLastMonthPeriod(currentTime);
    chrome.history.search({
      'text': '',
      'maxResults': 9999999,
      'startTime': timeStartEnd[0].getTime(),
      'endTime': timeStartEnd[1].getTime()
    }, function (res) {
      $window.res = res;

      // header row
      var keys = Object.keys(res[0]);
      $scope.append(keys.join(","));

      var row;
      for (var i = 0; i < res.length; i++) {
        row = "";
        for (var j = 0; j < keys.length; j++) {
          row += JSON.stringify(res[i][keys[j]]);
          if (j !== keys.length - 1) row += ",";
        }
        $scope.append("\n" + row);
      }

      var blob = new Blob([data.innerText], {type: 'application/octet-stream'});
      callback(blob, folderID);
    });
  }

  $scope.append = function (text) {
    $window.data.appendChild(document.createTextNode(text));
  }

  document.addEventListener('DOMContentLoaded', function () {
    $window.data = document.getElementById('data');
  });

  $scope.getLastMonthPeriod = function (time) {
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
}]);

function handleClientLoad() {
  // Load the API's client and auth2 modules.
  // Call the initClient function after the modules load.
  gapi.load('client:auth2',initClient);
}


function initClient() {
  // Initialize the gapi.client object, which app uses to make API requests.

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
    $('#auth-button').html('Sign Out');
    $('#auth-button').css('display', 'inline-block');
    $('#auth-button').removeClass("btn-success");
    $('#auth-button').addClass("btn btn-danger");
    $('#backup-button').css('display', 'inline-block');
    $('#backup-button').className = '';
    $('#backup-button').addClass("btn btn-primary");
    $('#signin-status').html('Authorized / Signed in.');
    $('#signin-status').removeClass("alert-warning");
    $('#signin-status').addClass("alert alert-info");
  } else {
    $('#auth-button').html('Sign In / Authorize');
    $('#auth-button').css('display', 'inline-block');
    $('#auth-button').removeClass("btn-danger");
    $('#auth-button').addClass("btn btn-success");
    $('#backup-button').css('display', 'none');
    $('#signin-status').html('Unauthorized / Signed out.');
    $('#signin-status').removeClass("alert-info");
    $('#signin-status').addClass("alert alert-warning");
    $('#backup-status').css('display', 'none');
  }
}






