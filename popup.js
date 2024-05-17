document.getElementById('run').addEventListener('click', function() {
  chrome.runtime.sendMessage({action: "runScript"});
});

document.addEventListener('DOMContentLoaded', function() {
  fetch(chrome.runtime.getURL('accounts.json'))
    .then(response => response.json())
    .then(data => {
      const dropdown = document.getElementById('emailDropdown');
      data.accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.email;
        option.textContent = account.email;
        dropdown.appendChild(option);
      });
    });

  // When the popup loads, ask the background page to check the  status
  chrome.runtime.sendMessage({action: "checkStatus"}, function(response) {
    // Update the label with the response from the background page
    const checkStatus = document.getElementById('checkStatus');
    if (response.hasEnergy) {
      checkStatus.textContent = 'Has good status';
    } else {
      checkStatus.textContent = 'No status';
    }
  });
});

// Trigger logout and login on dropdown selection
document.getElementById('emailDropdown').addEventListener('change', function() {
  const selectedEmail = document.getElementById('emailDropdown').value;
  if (selectedEmail) {
    fetch(chrome.runtime.getURL('accounts.json'))
      .then(response => response.json())
      .then(data => {
        const account = data.accounts.find(acc => acc.email === selectedEmail);
        if (account) {
          chrome.runtime.sendMessage({action: "logoutAndLogin", email: account.email, password: account.password});
        }
      });
  }
});
