document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveButton = document.getElementById('saveButton');
  const status = document.getElementById('status');

  // Load saved API key
  chrome.storage.local.get(['apiKey'], (result) => {
    if (result.apiKey) {
      apiKeyInput.value = result.apiKey;
    }
  });

  saveButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    
    chrome.storage.local.set({ apiKey: apiKey }, () => {
      status.textContent = 'API key saved!';
      setTimeout(() => {
        status.textContent = '';
      }, 2000);
    });
  });
}); 