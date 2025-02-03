let apiKey = '';

// Load API key from storage
chrome.storage.local.get(['apiKey'], (result) => {
  apiKey = result.apiKey;
});

// Create/update context menu items
async function updateContextMenu() {
  // First, remove all existing menu items
  await chrome.contextMenus.removeAll();
  
  // Load saved prompts
  const { prompts = [] } = await chrome.storage.local.get('prompts');
  
  // Create menu items for each prompt
  prompts.forEach(prompt => {
    chrome.contextMenus.create({
      id: prompt.id,
      title: prompt.title,
      contexts: ['selection']
    });
  });
}

// Listen for installation and update events
chrome.runtime.onInstalled.addListener(() => {
  updateContextMenu();
});

// Listen for changes to prompts in storage
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.prompts) {
    updateContextMenu();
  }
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

  // Load prompts
  const { prompts = [] } = await chrome.storage.local.get('prompts');
  const selectedPrompt = prompts.find(p => p.id === info.menuItemId);
  
  if (!selectedPrompt) {
    await sendMessageToTab(tab.id, {
      action: 'showResult',
      result: 'Prompt not found'
    });
    return;
  }

  const prompt = selectedPrompt.template.replace('{text}', selectedText);

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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