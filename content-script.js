// Button HTML structure
const buttonHTML = `
  <button id="sticky-button">Track my time</button>
`;

// Inject the button into the page
const body = document.body;
body.insertAdjacentHTML('beforeend', buttonHTML);

// Make the button sticky
const stickyButton = document.getElementById('sticky-button');
stickyButton.style.position = 'fixed';
stickyButton.style.bottom = '20px';
stickyButton.style.right = '20px';
stickyButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'buttonClicked', pageTitle: document.title }, (response) => {
        console.log('Response from background script:', response);
      });
  });