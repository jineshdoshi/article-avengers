'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.type === 'GREETINGS') {
//     const message = `Hi ${
//       sender.tab ? 'Con' : 'Pop'
//     }, my name is Bac. I am from Background. It's great to hear from you.`;
//
//     // Log message coming from the `request` parameter
//     console.log(request.payload.message);
//     // Send a response message
//     sendResponse({
//       message,
//     });
//   }
// });

// Main logic

// chrome.runtime.onMessage.addListener((msg) => {
//
//   if (msg.generateComic) {
//
//     // Get options
//     chrome.storage.sync.get(['age', 'style'], (options) => {
//
//       // Generate comic
//       const comic = generateComic(options);
//
//       // Send back
//       chrome.runtime.sendMessage({comic});
//
//     });
//
//   }
//
// });
//
// function generateComic(options) {
//   // Use options to generate comic
//   return comicHTML;
// }

// Comic generation logic

// chrome.runtime.onMessage.addListener(async (msg) => {
//
//   if (msg.generateComic) {
//     const {age, style} = msg.options;
//     const text = await getPageText();
//     const comic = await generateComic(text);
//
//     chrome.tabs.create({url: comic});
//
//   }
//
// });
//
// async function getPageText() {
//   // Get text via content script
// }
//
// async function generateComic(text) {
//   // Use APIs to generate comic
//   return comicURL;
// }

import Anthropic from '@anthropic-ai/sdk';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "generateComic") {
    let age = request.age;
    let style = request.style;

    // Fetch the content of the current tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      let currentTabId = tabs[0].id;
      chrome.tabs.sendMessage(currentTabId, {action: "getContent"}, function(response) {
        let content = response.content;

        const userQuestion = `Please provide a summary of the above text to explain someone of age ${age} in a ${style} comic book style.`;
        const prompt = `\n\n${content}\n\nHuman: ${userQuestion}\n\nAssistant:`;

        // Call your server to generate the comic
        // fetch('https://api.anthropic.com/v1/complete', {
        //   method: 'POST',
        //   body: JSON.stringify({content: prompt, age: age, style: style}),
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'anthropic-version': '2023-06-01',
        //     "x-api-key": `"${process.env.ANTHROPIC_API_KEY}"`
        //   }
        // })
        //   .then(response => response.blob())
        //   .then(blob => {
        //     // Create a new URL for the blob
        //     let url = URL.createObjectURL(blob);
        //
        //     // Open the URL in a new tab
        //     chrome.tabs.create({url: url});
        //   });
        chrome.storage.sync.get('apiKey', function(data) {
          let apiKey = data.apiKey;
          const anthropic = new Anthropic({ apiKey });
          const completion = anthropic.completions.create({
            model: 'claude-2',
            max_tokens_to_sample: 100000,
            prompt: prompt,
          })
            .then(response => response.completion)
            .then(data => {
              let url = URL.createObjectURL(data);
              chrome.tabs.create({url: url});
            });
        });
      });
    });
  }
});

