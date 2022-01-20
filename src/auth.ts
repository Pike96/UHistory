export function authTest() {
  chrome.identity.getAuthToken({interactive: true}, function(token) {
    console.log(token);
  });
}
