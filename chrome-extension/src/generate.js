// // Save click handler
// function generateOptions() {
//   const age = getAgeInput();
//   const style = getStyleInput();
//
//   saveToChromeStorage(age, style);
// }
//
// // Get age input value
// function getAgeInput() {
//   return document.getElementById('age').value;
// }
//
// // Get style input value
// function getStyleInput() {
//   return document.getElementById('style').value;
// }
//
// // Save to chrome.storage
// function saveToChromeStorage(age, style) {
//   chrome.storage.sync.set({
//     age,
//     style
//   });
// }
//
// // Initialize
// function init() {
//   document.getElementById('save').addEventListener('click', generateOptions);
// }
//
// init();

// Save options
document.getElementById('generate').addEventListener('click', () => {

  const age = document.getElementById('age').value;
  const style = document.getElementById('style').value;
  chrome.runtime.sendMessage({action: "generateComic", age: age, style: style});
});
