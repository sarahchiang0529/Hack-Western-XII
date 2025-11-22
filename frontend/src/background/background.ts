/**
 * Background Service Worker
 * Runs in the background and handles events, manages state, and coordinates actions
 */

import type { Message, MessageResponse } from '@/shared/types';
import { MessageType } from '@/shared/types';

// Listen for extension installation or update
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed or updated:', details.reason);
  
  if (details.reason === 'install') {
    // First time installation
    console.log('First time installation');
    
    // Initialize default storage values
    chrome.storage.sync.set({
      count: 0,
    });
  } else if (details.reason === 'update') {
    console.log('Extension updated to version:', chrome.runtime.getManifest().version);
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse: (response: MessageResponse) => void) => {
    console.log('Background received message:', message);
    
    // Handle different message types
    switch (message.type) {
      case MessageType.GET_DATA:
        handleGetData(sendResponse);
        return true; // Will respond asynchronously
        
      case MessageType.SET_DATA:
        handleSetData(message.payload, sendResponse);
        return true; // Will respond asynchronously
        
      case MessageType.UPDATE_COUNT:
        handleUpdateCount(message.payload, sendResponse);
        return true; // Will respond asynchronously
        
      default:
        sendResponse({ success: false, error: 'Unknown message type' });
        return false;
    }
  }
);

// Handle GET_DATA message
function handleGetData(sendResponse: (response: MessageResponse) => void) {
  chrome.storage.sync.get(null, (data) => {
    if (chrome.runtime.lastError) {
      sendResponse({ success: false, error: chrome.runtime.lastError.message });
    } else {
      sendResponse({ success: true, data });
    }
  });
}

// Handle SET_DATA message
function handleSetData(
  payload: Record<string, any>,
  sendResponse: (response: MessageResponse) => void
) {
  chrome.storage.sync.set(payload, () => {
    if (chrome.runtime.lastError) {
      sendResponse({ success: false, error: chrome.runtime.lastError.message });
    } else {
      sendResponse({ success: true, data: payload });
    }
  });
}

// Handle UPDATE_COUNT message
function handleUpdateCount(
  payload: { count: number },
  sendResponse: (response: MessageResponse) => void
) {
  chrome.storage.sync.set({ count: payload.count }, () => {
    if (chrome.runtime.lastError) {
      sendResponse({ success: false, error: chrome.runtime.lastError.message });
    } else {
      sendResponse({ success: true, data: { count: payload.count } });
    }
  });
}

// Listen for tab updates (optional - useful for content script injection)
chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('Tab updated:', tab.url);
    // You can perform actions when a tab is updated
  }
});

// Listen for browser action clicks (optional - if not using popup)
// chrome.action.onClicked.addListener((tab) => {
//   console.log('Extension icon clicked', tab);
// });

// Keep service worker alive (optional - use if needed)
// chrome.runtime.onStartup.addListener(() => {
//   console.log('Browser started');
// });

console.log('Background service worker initialized');

