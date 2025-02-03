document.addEventListener('DOMContentLoaded', async () => {
  const promptsList = document.getElementById('promptsList');
  const addPromptBtn = document.getElementById('addPrompt');

  // Initialize prompts if empty
  async function initializePrompts() {
    const { prompts } = await chrome.storage.local.get('prompts');
    if (!prompts) {
      await chrome.storage.local.set({ prompts: [] });
    }
  }

  // Load and display existing prompts
  async function loadPrompts() {
    const { prompts = [] } = await chrome.storage.local.get('prompts');
    promptsList.innerHTML = '';
    
    prompts.forEach(prompt => {
      const promptElement = document.createElement('div');
      promptElement.className = 'prompt-item';
      promptElement.innerHTML = `
        <div>
          <strong>${prompt.title}</strong> (${prompt.id})
          <br>
          <small>${prompt.template}</small>
        </div>
        <button class="delete-btn" data-prompt-id="${prompt.id}">Delete</button>
      `;
      promptsList.appendChild(promptElement);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', async (e) => {
        const promptId = e.target.dataset.promptId;
        if (!confirm('Are you sure you want to delete this prompt?')) return;
        
        const { prompts = [] } = await chrome.storage.local.get('prompts');
        const updatedPrompts = prompts.filter(p => p.id !== promptId);
        await chrome.storage.local.set({ prompts: updatedPrompts });
        await loadPrompts();
      });
    });
  }

  // Add new prompt
  addPromptBtn.addEventListener('click', async () => {
    const id = document.getElementById('promptId').value.trim();
    const title = document.getElementById('promptTitle').value.trim();
    const template = document.getElementById('promptTemplate').value.trim();

    if (!id || !title || !template) {
      alert('Please fill in all fields');
      return;
    }

    const { prompts = [] } = await chrome.storage.local.get('prompts');
    
    // Check for duplicate ID
    if (prompts.some(p => p.id === id)) {
      alert('A prompt with this ID already exists');
      return;
    }

    prompts.push({ id, title, template });
    await chrome.storage.local.set({ prompts });
    
    // Clear form
    document.getElementById('promptId').value = '';
    document.getElementById('promptTitle').value = '';
    document.getElementById('promptTemplate').value = '';
    
    await loadPrompts();
  });

  // Initialize and load
  await initializePrompts();
  await loadPrompts();
}); 