'use strict';

var listen; // Sign In Status Listener

function handleClientLoad() {
  // Load the API's client and auth2 modules.
  // Call the initClient function after the modules load.
  gapi.load('client:auth2', initClient);
}

function initClient() {
  // Initialize the gapi.client object, which app uses to make API requests.

  // Handle click event (JQuery)
  $('#sign-in-or-out-button').click(function() {
    if (gapi.auth.getToken() == null) {
      signin();
    } else {
      signout();
    }
  });

  // Sign in on load by default
  if (gapi.auth.getToken() == null) {
    signin();
    signinStatusListener();
  }

  // Start listener
  listen = setInterval(signinStatusListener, 500);
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

  clearInterval(listen);
  $('#auth-status').html('You have signed out. Please restart your browser');
}

function signinStatusListener() {
  if (gapi.auth.getToken() != null) {
    $('#sign-in-or-out-button').html('Sign out');
    $('#auth-status').html('You are currently signed in and have granted ' +
      'access to this app.');
  } else {
    $('#sign-in-or-out-button').html('Sign In / Authorize');
    $('#auth-status').html('You have not authorized this app or you are ' +
      'signed out.');
  }
}

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