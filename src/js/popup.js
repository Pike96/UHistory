'use strict';

var popupMod = angular.module('UHistoryPopup', []);
popupMod.config(function ($compileProvider) {
  // url whitelist
  $compileProvider.aHrefSanitizationWhitelist (/^\s*(https?|ftp|file|chrome-extension):/);
});

popupMod.controller('PopupCtrl', ['$scope', '$window', '$filter', '$interval', 
    function PopupCtrl($scope, $window, $filter, $interval) {
  $scope.setFileName = function () {
    if ($scope.checkboxModel) {
      $scope.fileName = "UHB" + $scope.text + ".txt";
      return;
    }
    var currentTime = new Date();
    currentTime.setDate(1);
    currentTime.setMonth(currentTime.getMonth() - $window.monthdiff);
    $scope.fileName = "UHB" + currentTime.getFullYear() +
      monthNames[currentTime.getMonth()] + ".txt";
  };

  $scope.checkboxModel = false;
  $scope.text = '';
  $scope.checkboxHandler = function () {
    if ($scope.checkboxModel) {
      angular.element($('#text-input')).removeAttr("disabled");
    }
    else {
      angular.element($('#text-input')).attr("disabled", "disabled");
    }
  };

  $scope.authButtonHandler = function () {
    if (gapi.auth.getToken() == null) {
      signin();
    } else {
      signout();
    }
  };

  $scope.backupButton1Handler = function () {
    $window.monthdiff = 1;
    $scope.setFileName();
    $scope.checker($scope.backupHelper);
  };

  $scope.backupButton2Handler = function () {
    $window.monthdiff = 2;
    $scope.setFileName();
    $scope.checker($scope.backupHelper);
  };

  $scope.backupButton3Handler = function () {
    $window.monthdiff = 3;
    $scope.setFileName();
    $scope.checker($scope.backupHelper);
  };

  $scope.readButtonHandler = function () {
    chrome.tabs.create({ url: chrome.runtime.getURL("../html/index.html") });
  };


  $scope.checker = function (callback) {
    gapi.client.drive.files.list({
      'q': "trashed = false and name = '" + $scope.fileName + "'",
      'fields': "nextPageToken, files(id, name)"
    }).then(function (response) {
      var files = response.result.files;
      angular.element($('#backup-status')).css('display', 'block');
      if (files && files.length > 0) {
        angular.element($('#backup-status')).html("Backuped: " + $scope.fileName);
        angular.element($('#backup-status')).removeClass("alert-warning alert-danger");
        angular.element($('#backup-status')).addClass("alert alert-success");
        return true;
      } else {
        if (!callback) {
          return false;
        }
        angular.element($('#backup-status')).html('Backuping ...');
        angular.element($('#backup-status')).removeClass("alert-danger alert-success");
        angular.element($('#backup-status')).addClass("alert alert-warning");
        callback();
        var check = setInterval($scope.progressChecker, 200);
        return false;
      }
    });
  };

  $scope.progressChecker = function () {
    if ($scope.checker()) {
      clearInterval(check);
    }
  };

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
          resource: folderMetadata
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
  };

  $scope.saveToFolder = function (fileData, folderID, callback) {
    $scope.setFileName();

    var boundary = '-------314159265358979323846';
    var delimiter = "\r\n--" + boundary + "\r\n";
    var close_delim = "\r\n--" + boundary + "--";

    var reader = new FileReader();
    reader.readAsBinaryString(fileData);
    reader.onload = function(e) {
      var contentType = 'application/octet-stream';
      var metadata = {
        'name': $scope.fileName,
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
  };

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
      if (res.length === 0) {
        angular.element($('#backup-status')).html('Backup failed! No history found in this month!');
        angular.element($('#backup-status')).removeClass("alert-secondary alert-success");
        angular.element($('#backup-status')).addClass("alert alert-danger");
        $window.errinfo = undefined;
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
  };

  $scope.append = function (text) {
    $window.data.appendChild(document.createTextNode(text));
  };

  document.addEventListener('DOMContentLoaded', function () {
    $window.data = document.getElementById('data');
  });

  $scope.getLastMonthPeriod = function (time) {
    var arr = [];
    var start =  new Date(time.getTime());
    start.setDate(1);
    start.setMonth(start.getMonth() - $window.monthdiff);
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

var monthNames = ["Jan", "Feb", "Mar",
  "Apr", "May", "Jun", "Jul", "Aug", "Sep",
  "Oct", "Nov", "Dec"];

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
  var time = new Date();
  time.setDate(1);
  time.setMonth(time.getMonth() - 1);
  var monthl = time.getMonth();
  time.setMonth(monthl - 1);
  var monthll = time.getMonth();
  time.setMonth(monthll - 1);
  var monthlll = time.getMonth();
  if (gapi.auth.getToken() != null) {
    $('#auth-button').html('Sign Out');
    $('#auth-button').css('display', 'inline-block');
    $('#auth-button').css('margin-top', '30px');
    $('#auth-button').removeClass("btn-success");
    $('#auth-button').addClass("btn btn-danger");
    $('#name-form').css('display', 'inline-block');
    $('#backup-label').css('display', 'inline-block');
    $('.btn-group').css('display', 'inline-block');
    $('#backup-button1').html(monthNames[monthl]);
    $('#backup-button2').html(monthNames[monthll]);
    $('#backup-button3').html(monthNames[monthlll]);
    $('#read-button').css('display', 'inline-block');
    $('#read-button').addClass("btn btn-success");
    $('#signin-status').html('Authorized / Signed in.');
    $('#signin-status').removeClass("alert-warning");
    $('#signin-status').addClass("alert alert-info");
  } else {
    $('#auth-button').html('Sign In / Authorize');
    $('#auth-button').css('display', 'inline-block');
    $('#auth-button').css('margin-top', '10px');
    $('#auth-button').removeClass("btn-danger");
    $('#auth-button').addClass("btn btn-success");
    $('#name-form').css('display', 'none');
    $('#backup-label').css('display', 'none');
    $('.btn-group').css('display', 'none');
    $('#read-button').css('display', 'none');
    $('#signin-status').html('Unauthorized / Signed out.');
    $('#signin-status').removeClass("alert-info");
    $('#signin-status').addClass("alert alert-warning");
    $('#backup-status').css('display', 'none');
  }
}






