

document.addEventListener('DOMContentLoaded', function() {
  // Select the radio buttons
  let options = document.querySelectorAll('input[name="options"]');

  // Iterate through each radio button
  for (let i = 0; i < options.length; i++) {
    // Add a click event listener to the radio button
    options[i].addEventListener('click', function() {
      // Remove the 'active' class from all labels
      for (let j = 0; j < options.length; j++) {
        options[j].parentNode.classList.remove('active');
      }

      // Add the 'active' class to the clicked radio button's label
      this.parentNode.classList.add('active');
    });
  }

  // Select the button
  let button = document.getElementById('generate');

  // Add a click event listener to the button
  button.addEventListener('click', function() {
    // Get the value of the age input
    let age = document.getElementById('age').value;

    // Get the value of the active radio button
    let style = document.querySelector('input[name="options"]:checked').id;

    chrome.runtime.sendMessage({action: "generateComic", age: age, style: style});
  });
});
