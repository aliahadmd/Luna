// Create and inject result containers
const resultContainer = document.createElement('div');
resultContainer.className = 'luna-ai-assistant luna-ai-assistant-result';
document.body.appendChild(resultContainer);

// Create a container for the original text
const originalTextContainer = document.createElement('div');
originalTextContainer.className = 'original-text';
resultContainer.appendChild(originalTextContainer);

// Create a container for the AI response
const aiResponseContainer = document.createElement('div');
aiResponseContainer.className = 'ai-response';
resultContainer.appendChild(aiResponseContainer);

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showResult') {
    showResult(message.result);
  }
});

function showResult(result) {
  // Store the selected text
  const selection = window.getSelection();
  const selectedText = selection.toString();
  
  // Display original text
  originalTextContainer.innerHTML = `<strong>Original Text:</strong><br>${selectedText}`;
  
  // Display AI response with typing effect
  aiResponseContainer.innerHTML = '<strong>AI Response:</strong><br>';
  const responseTextElement = document.createElement('div');
  responseTextElement.className = 'response-text';
  aiResponseContainer.appendChild(responseTextElement);
  
  // Show the container
  resultContainer.style.display = 'block';
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.className = 'close-button';
  closeButton.onclick = () => {
    resultContainer.style.display = 'none';
  };
  resultContainer.appendChild(closeButton);

  // Position near selected text
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Add some checks to ensure the popup stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let left = rect.left + window.scrollX;
    let top = rect.bottom + window.scrollY + 10;
    
    // Check right edge
    if (left + resultContainer.offsetWidth > viewportWidth) {
      left = viewportWidth - resultContainer.offsetWidth - 20;
    }
    
    // Check bottom edge
    if (top + resultContainer.offsetHeight > viewportHeight + window.scrollY) {
      top = rect.top + window.scrollY - resultContainer.offsetHeight - 10;
    }
    
    resultContainer.style.top = `${top}px`;
    resultContainer.style.left = `${left}px`;
  }

  // Simulate typing effect for the result
  let index = 0;
  const typeWriter = () => {
    if (index < result.length) {
      responseTextElement.textContent += result.charAt(index);
      index++;
      setTimeout(typeWriter, 20);
    }
  };
  typeWriter();
} 