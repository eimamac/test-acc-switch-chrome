const LOGOUT_URL = "https://example.com/oauth2/logout";
const LOGIN_URL = "https://www.example.com/ui";
const CLEAR_CACHE_URL = "https://example.com/api/clear";
const AUTHORIZATION_HEADER = "exampleAuthorizationHeader";
const BT_ENV = "exampleEnv";
const BASE_URL = "https://www.example.com";
const AUTH_COOKIE_NAME = "AuthorizationTokenExample";
const AUTH2_COOKIE_NAME = "Authorization2TokenExample";
const EMAIL_SELECTOR = 'input[name="email"]';
const PASSWORD_SELECTOR = 'input[name="password"]';
const LOGIN_BUTTON_SELECTOR = 'button[type="submit"]';


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "runScript") {
    clearApiCache();
  } else if (request.action === "checkStatus") {
    checkStatus(sendResponse);
    return true; 
  } else if (request.action === "logoutAndLogin") {
    logoutAndLogin(request.email, request.password);
  }
});

function clearApiCache() {
  chrome.cookies.get({ url: BASE_URL, name: AUTH_COOKIE_NAME }, function(auth4Cookie) {
    chrome.cookies.get({ url: BASE_URL, name: AUTH2_COOKIE_NAME }, function(auth3Cookie) {
      var myHeaders = new Headers();
      myHeaders.append("t-target", "authauth");

      if (auth3Cookie) {
        myHeaders.append("auth3-token", auth3Cookie.value);
      }

      if (auth4Cookie) {
        myHeaders.append("auth4-token", auth4Cookie.value);
      }

      myHeaders.append("example-env", BT_ENV);

      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      };

      fetch(CLEAR_CACHE_URL, requestOptions)
        .then(response => response.text())
        .then(result => {
          console.log(result);
          chrome.tabs.update({ url: LOGIN_URL });
        })
        .catch(error => console.log('error', error));
    });
  });
}


function logoutAndLogin(email, password) {
  fetch(LOGOUT_URL, { method: 'GET' })
    .then(response => {
      if (response.ok) {
        console.log('Logout successful, navigating to login page.');
        chrome.tabs.update({ url: LOGIN_URL }, function(tab) {
          chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
            if (changeInfo.status === 'complete' && tab.url === LOGIN_URL) {
              console.log('Login page loaded, injecting script.');
              chrome.tabs.executeScript(tabId, {
                code: `
                  function waitForElement(selector, callback) {
                    const element = document.querySelector(selector);
                    if (element) {
                      console.log('Found element:', selector);
                      callback(element);
                    } else {
                      console.log('Waiting for element:', selector);
                      setTimeout(() => waitForElement(selector, callback), 100);
                    }
                  }

                  function setFieldAndDispatchEvent(field, value) {
                    field.value = value;
                    field.dispatchEvent(new Event('input', { bubbles: true }));
                    console.log('Set value for field:', field, 'with value:', value);
                  }

                  waitForElement('${EMAIL_SELECTOR}', (emailField) => {
                    setFieldAndDispatchEvent(emailField, '${email}');
                    waitForElement('${PASSWORD_SELECTOR}', (passwordField) => {
                      setFieldAndDispatchEvent(passwordField, '${password}');
                      waitForElement('${LOGIN_BUTTON_SELECTOR}', (loginButton) => {
                        console.log('Clicking login button');
                        loginButton.click();
                      });
                    });
                  });
                `
              }, () => {
                console.log('Content script injected');
              });
              chrome.tabs.onUpdated.removeListener(arguments.callee);
            }
          });
        });
      }
    })
    .catch(error => console.log('Logout error', error));
}
