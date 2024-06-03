document.getElementById('run').addEventListener('click', function() {
  chrome.runtime.sendMessage({action: "runScript"});
});

document.addEventListener('DOMContentLoaded', function() {
  fetch(chrome.runtime.getURL('accounts.json'))
    .then(response => response.json())
    .then(data => {
      const tableBody = document.getElementById('accountsTable').querySelector('tbody');
      const searchInput = document.getElementById('searchInput');
      
      function renderTable(accounts) {
        tableBody.innerHTML = '';
        accounts.forEach(account => {
          const row = document.createElement('tr');
          
          // Create email cell
          const emailCell = document.createElement('td');
          emailCell.classList.add('email');
          emailCell.textContent = account.email;
          emailCell.addEventListener('click', function() {
            chrome.runtime.sendMessage({action: "logoutAndLogin", email: account.email, password: account.password});
          });
          row.appendChild(emailCell);
          
          // Create alp cell
          const alpCell = document.createElement('td');
          alpCell.classList.add('alp');
          if (Array.isArray(account.alp) && account.alp.length > 1) {
            const alpDropdown = document.createElement('select');
            alpDropdown.classList.add('alp');
            account.alp.forEach(alp => {
              const option = document.createElement('option');
              option.value = alp;
              option.textContent = alp;
              alpDropdown.appendChild(option);
            });
            alpDropdown.addEventListener('change', function() {
              navigator.clipboard.writeText(alpDropdown.value).then(() => {
                const originalText = alpDropdown.value;
                alpDropdown.options[alpDropdown.selectedIndex].textContent = 'copied';
                setTimeout(() => {
                  alpDropdown.options[alpDropdown.selectedIndex].textContent = originalText;
                }, 2000); // Revert after 2 seconds
              });
            });
            alpCell.appendChild(alpDropdown);
          } else {
            alpCell.textContent = account.alp;
            alpCell.addEventListener('click', function() {
              navigator.clipboard.writeText(account.alp).then(() => {
                const originalText = alpCell.textContent;
                alpCell.textContent = 'copied';
                setTimeout(() => {
                  alpCell.textContent = originalText;
                }, 2000); // Revert after 2 seconds
              });
            });
          }
          row.appendChild(alpCell);
          
          // Create description cell
          const descriptionCell = document.createElement('td');
          descriptionCell.classList.add('description');
          descriptionCell.textContent = account.description;
          row.appendChild(descriptionCell);

          tableBody.appendChild(row);
        });
      }

      renderTable(data.accounts);

      searchInput.addEventListener('input', function() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredAccounts = data.accounts.filter(account => 
          account.email.toLowerCase().includes(searchTerm) ||
          (Array.isArray(account.alp) ? account.alp.some(alp => alp.includes(searchTerm)) : account.alp.includes(searchTerm)) ||
          account.description.toLowerCase().includes(searchTerm)
        );
        renderTable(filteredAccounts);
      });
    });

  // When the popup loads, ask the background page to check the alpha status
  chrome.runtime.sendMessage({action: "checkalphaStatus"}, function(response) {
    // Update the label with the response from the background page
    const alphaStatus = document.getElementById('alphaStatus');
    if (response.hasalpha) {
      alphaStatus.textContent = 'Has alpha';
    } else {
      alphaStatus.textContent = 'No alpha';
    }
  });
});
