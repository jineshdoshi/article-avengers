document.getElementById('optionsForm').addEventListener('submit', function(event) {
  // Prevent the form from submitting normally
  event.preventDefault();

  let apiKey = document.getElementById('apiKey').value;

  // Save the API key to the Chrome storage
  chrome.storage.sync.set({apiKey: apiKey}, function() {
    alert('Options saved.');
  });
});

// Load the saved API key and populate the input field
chrome.storage.sync.get('apiKey', function(data) {
  document.getElementById('apiKey').value = data.apiKey;
});
