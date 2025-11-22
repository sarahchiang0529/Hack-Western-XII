/**
 * Shared TypeScript types for the Chrome extension
 */

// Storage data structure
export interface StorageData {
  count?: number;
  // Add more storage fields as needed
}

// Message types for communication between different parts of the extension
export interface Message {
  type: MessageType;
  payload?: any;
}

export enum MessageType {
  GET_DATA = 'GET_DATA',
  SET_DATA = 'SET_DATA',
  UPDATE_COUNT = 'UPDATE_COUNT',
  // Add more message types as needed
}

// Tab information
export interface TabInfo {
  id: number;
  url?: string;
  title?: string;
}

// Response structure for async message passing
export interface MessageResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

