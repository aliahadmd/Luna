let apiKey = '';

// Load API key from storage
chrome.storage.local.get(['apiKey'], (result) => {
  apiKey = result.apiKey;
});

// Create context menu items
chrome.runtime.onInstalled.addListener(() => {
  const menuItems = [
    { id: 'summarize', title: 'Summarize Text' },
    { id: 'grammar', title: 'Check Grammar' },
    { id: 'translate', title: 'Translate' },
    { id: 'expand', title: 'Expand Text' },
    { id: 'shorten', title: 'Shorten Text' },
    { id: 'rewrite', title: 'Rewrite Text' },
    { id: 'tone-formal', title: 'Make Text Formal' },
    { id: 'tone-casual', title: 'Make Text Casual' },
    { id: 'simplify', title: 'Simplify Text' },
    { id: 'summarize-bullet', title: 'Summarize in Bullet Points' },
    { id: 'key-points', title: 'Extract Key Points' },
    { id: 'translate-en', title: 'Translate to English' },
    { id: 'translate-bn', title: 'Translate to Bangla' },
    { id: 'paraphrase', title: 'Paraphrase Text' },
    { id: 'emoji', title: 'Add Emojis' },
    { id: 'code-explain', title: 'Explain Code' },
    { id: 'persuasive', title: 'Make Text Persuasive' },
    { id: 'story', title: 'Convert to Story' },
    { id: 'headline', title: 'Generate Headline' },
    { id: 'hashtags', title: 'Generate Hashtags' },
    { id: 'question', title: 'Convert to Question' },
  ];
  

  menuItems.forEach(item => {
    chrome.contextMenus.create({
      id: item.id,
      title: item.title,
      contexts: ['selection']
    });
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const selectedText = info.selectionText;
  
  if (!apiKey) {
    await sendMessageToTab(tab.id, {
      action: 'showResult',
      result: 'Please set your Google AI API key by clicking the extension icon in the toolbar.'
    });
    return;
  }

  let prompt;
  switch (info.menuItemId) {
    case 'expand':
      prompt = `Please expand on the following text, adding more details and context:\n${selectedText}`;
      break;
    case 'shorten':
      prompt = `Please shorten the following text while keeping the main points intact:\n${selectedText}`;
      break;
    case 'rewrite':
      prompt = `Please rewrite the following text in a clearer and more natural way:\n${selectedText}`;
      break;
    case 'tone-formal':
      prompt = `Please rewrite the following text in a formal tone:\n${selectedText}`;
      break;
    case 'tone-casual':
      prompt = `Please rewrite the following text in a more casual and friendly tone:\n${selectedText}`;
      break;
    case 'simplify':
      prompt = `Please simplify the following text for easier understanding:\n${selectedText}`;
      break;
    case 'summarize-bullet':
      prompt = `Please summarize the following text in bullet points:\n${selectedText}`;
      break;
    case 'key-points':
      prompt = `Please extract and list the key points from the following text:\n${selectedText}`;
      break;
    case 'translate-en':
      prompt = `Please translate the following text to English:\n${selectedText}`;
      break;
    case 'translate-bn':
      prompt = `Please translate the following text to Bangla:\n${selectedText}`;
      break;
    case 'paraphrase':
      prompt = `Please paraphrase the following text while keeping its original meaning:\n${selectedText}`;
      break;
    case 'emoji':
      prompt = `Please rewrite the following text and add relevant emojis to enhance it:\n${selectedText}`;
      break;
    case 'code-explain':
      prompt = `Please explain the following code in simple terms:\n${selectedText}`;
      break;
    case 'persuasive':
      prompt = `Please rewrite the following text to make it more persuasive and engaging:\n${selectedText}`;
      break;
    case 'story':
      prompt = `Please turn the following text into a short engaging story:\n${selectedText}`;
      break;
    case 'headline':
      prompt = `Please generate a catchy headline based on the following text:\n${selectedText}`;
      break;
    case 'hashtags':
      prompt = `Please generate relevant hashtags for the following text:\n${selectedText}`;
      break;
    case 'question':
      prompt = `Please convert the following statement into an engaging question:\n${selectedText}`;
      break;
    
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      const result = data.candidates[0].content.parts[0].text;
      await sendMessageToTab(tab.id, {
        action: 'showResult',
        result: result
      });
    } else if (data.error) {
      throw new Error(data.error.message || 'API error occurred');
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error:', error);
    await sendMessageToTab(tab.id, {
      action: 'showResult',
      result: `Error: ${error.message || 'Failed to process request. Please check your API key and try again.'}`
    });
  }
});

// Helper function to ensure content script is injected before sending message
async function sendMessageToTab(tabId, message) {
  try {
    // Try sending message directly first
    await chrome.tabs.sendMessage(tabId, message);
  } catch (error) {
    // If content script is not injected, inject it first
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content/content.js']
    });
    // Insert CSS
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ['styles/styles.css']
    });
    // Try sending message again
    await chrome.tabs.sendMessage(tabId, message);
  }
} 