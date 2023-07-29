// Save click handler
function saveOptions() {
  const age = getAgeInput();
  const style = getStyleInput();

  saveToChromeStorage(age, style);
}

// Get age input value
function getAgeInput() {
  return document.getElementById('age').value;
}

// Get style input value
function getStyleInput() {
  return document.getElementById('style').value;
}

// Save to chrome.storage
function saveToChromeStorage(age, style) {
  chrome.storage.sync.set({
    age,
    style
  });
}

// Initialize
function init() {
  document.getElementById('save').addEventListener('click', saveOptions);
}

init();
