'use strict';

import Anthropic from '@anthropic-ai/sdk';
console.log("Background script running...");

function getFromStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([key], function(result) {
      if (chrome.runtime.lastError) {
        // An error occurred
        return reject(chrome.runtime.lastError);
      }
      resolve(result[key]);
    });
  });
}

export const textToImage = async (text) => {
  const path =
    "https://api.stability.ai/v1/generation/stable-diffusion-xl-beta-v2-2-2/text-to-image";

  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${STABILITY_API_KEY}`
  };

  const body = {
    width: 512,
    height: 512,
    steps: 50,
    seed: 0,
    cfg_scale: 7,
    samples: 1,
    style_preset: "enhance",
    text_prompts: [
      {
        "text": text,
        "weight": 1
      }
    ],
  };

  const response = fetch(
    path,
    {
      headers,
      method: "POST",
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new Error(`Non-200 response: ${await response.text()}`)
  }

  const responseJSON = await response.json();

  responseJSON.artifacts.forEach((image, index) => {
    fs.writeFileSync(
      `./out/txt2img_${image.seed}.png`,
      Buffer.from(image.base64, 'base64')
    )
  })
};

async function getTextToImage(comicSummary) {

  try {

    let userQuery = "A digital illustration of a comic book with conversation between 2 characters outlined in the following Screenplay."
    let prompt = `\n\n${userQuery}\n\nScreenplay: ${comicSummary}:`;

    const StabilityApiKey = await getFromStorage('StabilityApiKey');

    const path =
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-beta-v2-2-2/text-to-image";

    const headers = {
      'Content-Type': 'application/json',
      'Accept': "application/json",
      'Authorization': "Bearer " + StabilityApiKey
    };

    const body = {
      width: 512,
      height: 512,
      steps: 50,
      seed: 0,
      cfg_scale: 7,
      samples: 1,
      style_preset: "enhance",
      text_prompts: [
        {
          "text": prompt,
          "weight": 1
        }
      ],
    };

    const response = fetch(
      path,
      {
        headers,
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    let res = await response;

    if (!res.ok) {
      console.log(res);
      // throw new Error(`Non-200 response: ${await response.text()}`)
    }

    const responseJSON = await res.json();
    console.log(responseJSON);
    return responseJSON;
  } catch (error) {
    console.error('Error:', error);
  }
}

async function getCurrentPageContent() {

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

  /*
  // TODO: Error: Anthropic TS SDK client not initializing correctly. So we are using the REST API.
  chrome.storage.sync.get('AnthropicApiKey', function(data) {
    let anthropicApiKey = data.AnthropicApiKey;
    const anthropic = new Anthropic({apiKey: anthropicApiKey, authToken: ""});
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

   */
}

async function getComicSummary(pageContent, age, style) {
  const userQuestion = `Please generate a conversation between 2 comic characters with a summary of the above text to explain someone of age ${age} in a ${style} comic book style.`;
  const prompt = `\n\n${pageContent}\n\nHuman: ${userQuestion}\n\nAssistant:`;
  console.log(prompt);

  try {
    const AnthropicApiKey = await getFromStorage('AnthropicApiKey')
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
    return data.completion;

  } catch (error) {
    console.error('Error:', error);
  }
}

async function generatePdf(comicSummary) {
  chrome.runtime.sendMessage({action: "generatePDF", data: comicSummary});
}

async function generateImgPDF(comicSummary) {
  chrome.runtime.sendMessage({action: "generateImgPDF", data: comicSummary});
}

chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
  // console.log('Background script Message received:', request);
  if (request.action === "generateComic") {
    let age = request.age;
    let style = request.style;

    const pageContent = await getCurrentPageContent();
    // await generateComicPdf(pageContent, age, style);
    const comicSummary = await getComicSummary(pageContent, age, style);
    if (comicSummary) {
      console.log(comicSummary);
      // generatePdf(comicSummary);

      // generate images from stability.ai
      const comicImg = await getTextToImage(comicSummary);
      console.log(comicImg.artifacts[0].base64);
      console.log("Generating PDF");
      generateImgPDF(comicImg.artifacts[0].base64);
    } else {
      console.log("No comic summary");
    }
  }
});

