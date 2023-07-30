'use strict';

import Anthropic from '@anthropic-ai/sdk';
console.log("Background script running...");

async function getPageContent() {

  var text;

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  const results = await chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: () => {
      text = document.documentElement.innerText;
      return {text: text}
    }
  });
  return results[0].result.text;
}

chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
  console.log('Background script Message received:', request);
  if (request.action === "generateComic") {
    let age = request.age;
    let style = request.style;

    const pageContent = await getPageContent();

    const userQuestion = `Please generate a conversation between 2 comic characters with a summary of the above text to explain someone of age ${age} in a ${style} comic book style.`;
    const prompt = `\n\n${pageContent}\n\nHuman: ${userQuestion}\n\nAssistant:`;
    console.log(prompt);

    chrome.storage.sync.get('AnthropicApiKey', async function (data) {
      let AnthropicApiKey = data.AnthropicApiKey;
      try {
        const reqData = {
          "model": "claude-2",
          "prompt": prompt,
          "max_tokens_to_sample": 100000
        }
        let response = await fetch('https://api.anthropic.com/v1/complete', {
          method: 'POST',
          body: JSON.stringify(reqData),
          headers: {
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
            'x-api-key': AnthropicApiKey
          }
        });

        let data = await response.json();
        // console.log("data: ", data.completion);
        chrome.runtime.sendMessage({action: "generatePDF", data: data.completion});

      } catch (error) {
        console.error('Error:', error);
      }
    });

    // TODO: Error: Anthropic TS SDK client not initializing correctly. So we are using the REST API.
    // chrome.storage.sync.get('apiKey', function(data) {
    //   let apiKey = data.apiKey;
    //   const anthropic = new Anthropic({apiKey: apiKey, authToken: ""});
    //   const completion = anthropic.completions.create({
    //     model: 'claude-2',
    //     max_tokens_to_sample: 100000,
    //     prompt: prompt,
    //   })
    //     .then(response => response.completion)
    //     .then(data => {
    //       let url = URL.createObjectURL(data);
    //       chrome.tabs.create({url: url});
    //     });
    // });
  }
});

