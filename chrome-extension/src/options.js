document.getElementById('optionsForm').addEventListener('submit', function(event) {
  // Prevent the form from submitting normally
  event.preventDefault();

  let AnthropicApiKey = document.getElementById('AnthropicApiKey').value;

  // Save the API key to the Chrome storage
  chrome.storage.sync.set({AnthropicApiKey: AnthropicApiKey}, function() {
    alert('Options saved.');
  });
});

// Load the saved API key and populate the input field
chrome.storage.sync.get('AnthropicApiKey', function(data) {
  document.getElementById('AnthropicApiKey').value = data.apiKey;
});
