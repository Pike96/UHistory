'use strict';

var x = "6";

function backupHistory() {
  if (typeof gapi === 'undefined' || gapi.auth.getToken() == null) {
    console.log(x);
  }
}

