
console.log("Popup script loaded");
document.getElementById('generate').addEventListener('click', () => {

  const age = document.getElementById('age').value;
  const style = document.getElementById('style').value;
  chrome.runtime.sendMessage({action: "generateComic", age: age, style: style});
});
