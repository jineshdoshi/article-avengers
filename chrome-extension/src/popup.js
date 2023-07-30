import {jsPDF} from "jspdf";

function generatePDF(data) {
  // Create a new instance of a jsPDF document
  let doc = new jsPDF();

  let pageHeight = doc.internal.pageSize.getHeight();  // Get the page height
  let y = 10;  // Y position of the next line
  let lineHeight = 10;  // Line height for each new line

  // Split the data into lines
  let lines = doc.splitTextToSize(data, 180);  // 180 is the max width

  // Iterate over each line
  lines.forEach(line => {
    // If this line will be below the page, add a new page
    if (y + lineHeight > pageHeight) {
      doc.addPage();
      y = 10;  // Reset the y position to the top of the new page
    }

    // Add the line of text
    doc.text(line, 10, y);

    // Increment the y position for the next line
    y += lineHeight;
  });

  // Output the document as a Blob
  let pdfBlob = doc.output('blob');

  // Create an object URL for the Blob
  return URL.createObjectURL(pdfBlob);
}

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

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "generatePDF") {
      window.open(generatePDF(request.data), '_blank');
    }
  });

});
