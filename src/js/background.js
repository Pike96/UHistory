'use strict';

var bgMod = angular.module('UHistoryBg', []);
bgMod.config(function ($compileProvider) {
  // url whitelist
  $compileProvider.aHrefSanitizationWhitelist (/^\s*(https?|ftp|file|chrome-extension):/);
});

bgMod.controller('BgCtrl', ['$scope', '$window', '$filter', '$interval', function BgCtrl($scope, $window, $filter, $interval) {
  $scope.monthNames = ["Jan", "Feb", "Mar",
    "Apr", "May", "Jun", "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec"];
  $scope.firstAuth = $interval(function () {$scope.refreshToken()}, 1000, 1);
  $scope.autoAuth = $interval(function () {$scope.refreshToken()}, 1800000);// 30 min

  $scope.refreshToken = function () {
    if (typeof gapi === 'undefined') {
      return;
    }
    // gapi.auth.authorize({'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': true});
    // gapi.client.load('drive', 'v3').then(function() {
    //   checker(backupHelper);
    // });

    chrome.identity.getAuthToken({ 'interactive': false }, function(token) {
      if (token == null) {
        return;
      }
      gapi.auth.setToken({ 'access_token': token });
      gapi.client.load('drive', 'v3').then(function() {
        $scope.checker($scope.backupHelper);
      });
    });
  }

  $scope.checker = function (callback) {
    if (typeof gapi === 'undefined') {
      return;
    }
    var currentTime = new Date();
    currentTime.setDate(1);
    currentTime.setMonth(currentTime.getMonth() - 1);
    var fileName = "UHB" + currentTime.getFullYear() +
        $scope.monthNames[currentTime.getMonth()] + ".txt";

    gapi.client.drive.files.list({
      'q': "trashed = false and name = '" + fileName + "'",
      'fields': "nextPageToken, files(id, name)"
    }).then(function (response) {
      var files = response.result.files;
      if (files && files.length > 0) {
        //document.write("Backuped: " + fileName);
        return true;
      } else {
        if (!callback) {
          return false;
        }
        //document.write("Backuping ...");
        callback();
        return false;
      }
    });
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
    currentTime.setDate(1);
    currentTime.setMonth(currentTime.getMonth() - 1);
    var fileName = "UHB" + currentTime.getFullYear() +
      $scope.monthNames[currentTime.getMonth()] + ".txt";

    var reader = new FileReader();
    reader.readAsBinaryString(fileData);
    reader.onload = function(e) {
      var contentType = 'application/octet-stream';
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
      if (res.length == 0) {
        return;
      }

      // header row
      var keys = Object.keys(res[0]);
      $scope.append(keys.join("`|`|"));

      var row;
      for (var i = 0; i < res.length; i++) {
        row = "";
        for (var j = 0; j < keys.length; j++) {
          row += "`|`|" + (res[i][keys[j]]) + "`|`|";
          if (j !== keys.length - 1) row += "|@|@";
        }
        $scope.append("\n" + row);
      }

      var blob = new Blob([data.innerText], {type: 'application/octet-steam'});
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
    var arr = [];
    var start =  new Date(time.getTime());
    start.setDate(1);
    start.setMonth(start.getMonth() - 1);
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    start.setMilliseconds(0);
    var end = new Date(start.getTime());
    end.setMonth(end.getMonth() + 1);
    arr.push(new Date(start.getTime()));
    arr.push(new Date(end.getTime()));
    return arr;
  }
}]);

function handleClientLoad() {
  // Load the API's client and auth2 modules.
  // Call the initClient function after the modules load.
  gapi.load('client:auth2');
}
