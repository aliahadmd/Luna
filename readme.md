# AI Text Assistant

A Chrome extension that provides AI-powered text processing capabilities. The extension allows users to select text on a webpage and receive an AI-generated response, displayed in a popup near the selected text.

## Overview

This extension uses Chrome's Manifest V3 architecture and integrates with Google's Generative Language API to provide AI-powered text analysis and responses.

## Features

- AI-powered text processing
- Context-aware responses
- Typing effect for responses
- Position-aware popup display
- Customizable styling
- Content script injection

## Requirements

- Chrome browser (version supporting Manifest V3)
- Internet connection
- Google Generative Language API access

## Installation

1. Clone the repository
2. In Chrome, go to chrome://extensions
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory

## Usage

1. Select text on any webpage
2. Right-click the selection (or use the extension's context menu)
3. The extension will display an AI-generated response in a popup near the selected text
4. The response will be typed out with a typing effect
5. Close the popup using the × button

## new 

These changes will:

1. Add a new settings page where users can manage prompts
2. Store prompts in chrome.storage.local
3. Allow CRUD operations for prompts through the UI
4. Make the context menu dynamic based on stored prompts
5. Maintain backward compatibility with default prompts

To use the new functionality:

1. Click the extension icon in the toolbar
2. Click "Extension Options" or right-click and select "Options"
3. Use the settings page to add, view, or delete prompts
4. The context menu will automatically update with your custom prompts

The prompts are stored with three components:
- id: Unique identifier for the prompt
- title: What appears in the context menu
- template: The actual prompt template with {text} placeholder

This makes the extension much more flexible and allows users to customize it for their specific needs without touching the code.


## Architecture

### Background Script (background.js)
- Handles communication between the extension and content scripts
- Manages injection of content scripts and styles
- Implements retry logic for message passing

### Content Script (content.js)
- Displays the AI response in a position-aware container
- Implements the typing effect for responses
- Handles user interaction (closing the popup)

### Manifest (manifest.json)
- Defines the extension's permissions and structure
- Specifies content scripts and styling
- Declares dependencies and required permissions

## Known Limitations

- Requires Google Generative Language API access
- Limited to Chrome browsers
- The typing effect speed is fixed (20ms per character)
- The popup positioning may need adjustment for certain web pages

## Future Improvements

- Add user customization for typing speed
- Implement more sophisticated error handling
- Add support for multiple selection contexts
- Improve the styling of the popup container
- Add configuration options for API endpoints

## License

[Your License Here]