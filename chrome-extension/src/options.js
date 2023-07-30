document.getElementById('optionsForm').addEventListener('submit', function(event) {
  // Prevent the form from submitting normally
  event.preventDefault();

  let anthropicApiKey = document.getElementById('AnthropicApiKey').value;
  let stabilityApiKey = document.getElementById('StabilityApiKey').value;

  // Save the AnthropicApiKey to the Chrome storage
  chrome.storage.sync.set({AnthropicApiKey: anthropicApiKey}, function() {
    alert('Options saved.');
  });

  // Save the StabilityApiKey to the Chrome storage
  chrome.storage.sync.set({StabilityApiKey: stabilityApiKey}, function() {
    alert('Options saved.');
  });

});

// Load the saved API key and populate the input field
chrome.storage.sync.get('AnthropicApiKey', function(data) {
  document.getElementById('AnthropicApiKey').value = data.AnthropicApiKey;
});

chrome.storage.sync.get('StabilityApiKey', function(data) {
  document.getElementById('StabilityApiKey').value = data.StabilityApiKey;
});
