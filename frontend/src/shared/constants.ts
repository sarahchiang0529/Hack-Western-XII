/**
 * Shared constants for the Chrome extension
 */

export const APP_NAME = 'Chrome Extension';
export const APP_VERSION = '1.0.0';

// Storage keys
export const STORAGE_KEYS = {
  COUNT: 'count',
  USER_PREFERENCES: 'userPreferences',
} as const;

// Default values
export const DEFAULTS = {
  COUNT: 0,
} as const;

// API endpoints (if using external APIs)
export const API_ENDPOINTS = {
  // Add your API endpoints here
} as const;

// Extension-specific constants
export const EXTENSION_CONFIG = {
  POPUP_WIDTH: 400,
  POPUP_HEIGHT: 600,
  DEBOUNCE_DELAY: 300,
} as const;

