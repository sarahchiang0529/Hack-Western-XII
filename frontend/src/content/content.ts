/**
 * Content Script
 * Runs in the context of web pages and can interact with the DOM
 */

import type { Message, MessageResponse } from '@/shared/types';
import { MessageType } from '@/shared/types';

console.log('Content script loaded');

// Example: Listen for messages from popup or background script
chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse: (response: MessageResponse) => void) => {
    console.log('Content script received message:', message);
    
    // Handle different message types
    switch (message.type) {
      case MessageType.GET_DATA:
        // Example: Get data from the current page
        const pageData = {
          title: document.title,
          url: window.location.href,
        };
        sendResponse({ success: true, data: pageData });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
    
    return true; // Will respond asynchronously
  }
);

// Example: Send a message to the background script
function _sendMessageToBackground(message: Message): Promise<MessageResponse> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response: MessageResponse) => {
      resolve(response);
    });
  });
}

// Example: Inject custom styles into the page
function _injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Add your custom styles here */
    .chrome-extension-highlight {
      background-color: yellow;
      padding: 2px 4px;
      border-radius: 3px;
    }
  `;
  document.head.appendChild(style);
}

// Example: Observe DOM changes
function _observeDOMChanges() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // Handle DOM changes
      console.log('DOM changed:', mutation);
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Example: Add event listeners to the page
function _addEventListeners() {
  document.addEventListener('click', (event) => {
    // Handle click events
    console.log('Page clicked:', event.target);
  });
}

// Initialize content script
function init() {
  console.log('Content script initialized on:', window.location.href);
  
  // Uncomment the functions you want to use:
  // _injectStyles();
  // _observeDOMChanges();
  // _addEventListeners();
  
  // Example: Send initial message to background
  // _sendMessageToBackground({
  //   type: MessageType.GET_DATA,
  // }).then((response) => {
  //   console.log('Background response:', response);
  // });
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

