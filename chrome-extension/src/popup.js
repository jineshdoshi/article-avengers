import {jsPDF} from "jspdf";
import 'jspdf-autotable';

function generateImgPDF(base64Image, pixelWidth, pixelHeight, bookInfo) {
  console.log("inside generateImgPDF: ", base64Image);
  let doc = new jsPDF();

  doc.setFontSize(22);
  doc.text(bookInfo.title, 10, 20);

  // Add a new page for the dialogues and images
  doc.addPage();

  // Variables for image dimensions
  const imgWidth = Math.ceil(pixelWidth/2.85), imgHeight = Math.ceil(pixelHeight/3.2), imgX = 10, imgY = 10;

  // Add each image and dialogue to the PDF
  for (let i = 0; i < bookInfo.images.length; i++) {
    // If this is not the first image/dialogue, add a new page
    if (i > 0) {
      doc.addPage();
    }

    // Add the image to the page
    doc.addImage(bookInfo.images[i], "PNG", imgX, imgY, imgWidth, imgHeight);

    // Calculate the position for the dialogue
    let dialoguePosition = 10 + imgHeight + 10;

    // Add the dialogues to the page
    doc.setFontSize(12);
    let firstCharacter = bookInfo.characters[0];
    let secondCharacter = bookInfo.characters[1];
    console.log(firstCharacter);
    console.log(secondCharacter);
    doc.text(`${firstCharacter}: ${bookInfo.dialogues[firstCharacter][i]}`, 10, dialoguePosition);
    doc.text(`${secondCharacter}: ${bookInfo.dialogues[secondCharacter][i]}`, 10, dialoguePosition + 10);
  }

  // // Define image dimensions and position
  // // const imgWidth = 180, imgHeight = 160, imgX = 10, imgY = 10;
  // // const imgWidth = Math.ceil(pixelWidth/2.85), imgHeight = Math.ceil(pixelHeight/3.2), imgX = 10, imgY = 10;
  //
  // // Add the base64 image to the document
  // doc.addImage(base64Image, 'JPEG', imgX, imgY, imgWidth, imgHeight);
  //
  // // Define the text and measure its width
  // const textWidth = doc.getTextWidth(bookInfo.title);
  //
  // // Define rectangle coordinates and dimensions
  // const padding = 10; // Padding on either side of the text
  // const rectWidth = textWidth + padding * 2, rectHeight = 20;
  // const rectX = imgX, rectY = imgY + imgHeight - rectHeight; // place rectHeight units above the bottom of the image
  //
  // // Create a filled rectangle
  // doc.setFillColor(255, 255, 255); // white fill color
  // doc.rect(rectX, rectY, rectWidth, rectHeight, 'F');
  //
  // // Add text to the rectangle
  // const textX = rectX + padding; // padding from the left
  // const textY = rectY + rectHeight / 2 + 3; // vertically center text with a slight adjustment
  // doc.text(text, textX, textY);

  // Output the document as a Blob
  let pdfBlob = doc.output('blob');

  // Create an object URL for the Blob
  return URL.createObjectURL(pdfBlob);
}

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

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "generateImgPDF") {
      console.log("popup generateImgPDF listener: ", request.data);
      window.open(generateImgPDF(request.data, request.pixelWidth, request.pixelHeight, request.bookInfo), '_blank');
    }
  });

});
