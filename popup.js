document.getElementById('run').addEventListener('click', function() {
  chrome.runtime.sendMessage({ action: "runScript" });
});

document.addEventListener('DOMContentLoaded', function() {
  fetch(chrome.runtime.getURL('datafile.json'))
    .then(response => response.json())
    .then(data => {
      const tableBody = document.getElementById('accountsTable').querySelector('tbody');
      data.accounts.forEach(account => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="email" data-email="${account.email}">${account.email}</td>
          <td class="attribute">${account.attribute}</td>
          <td class="description">${account.description}</td>
        `;
        row.querySelector('.email').addEventListener('click', function () {
          chrome.runtime.sendMessage({ action: "logoutAndLogin", email: account.email, password: account.password });
        });
        row.querySelector('.attribute').addEventListener('click', function () {
          navigator.clipboard.writeText(account.attribute).then(() => {
            const attributeCell = row.querySelector('.attribute');
            const originalText = attributeCell.textContent;
            attributeCell.textContent = 'copy that';
            setTimeout(() => {
              attributeCell.textContent = originalText;
            }, 2000); // Revert after 2 seconds
          });
        });

        let hoverTimeout;
        const emailCell = row.querySelector('.email');

        emailCell.addEventListener('mouseenter', function () {
          hoverTimeout = setTimeout(() => {
            emailCell.classList.add('break-lines');
          }, 2000); // Break lines after 2 seconds
        });

        emailCell.addEventListener('mouseleave', function () {
          clearTimeout(hoverTimeout);
          emailCell.classList.remove('break-lines');
        });

        tableBody.appendChild(row);
      });
    });

  // When the popup loads, ask the background page to check the status
  chrome.runtime.sendMessage({ action: "checkalphaStatus" }, function (response) {
    // Update the label with the response from the background page
    const alphaStatus = document.getElementById('alphaStatus');
    if (response.hasalpha) {
      alphaStatus.textContent = 'Has alpha ';
    } else {
      alphaStatus.textContent = 'No alpha ';
    }
  });
});
