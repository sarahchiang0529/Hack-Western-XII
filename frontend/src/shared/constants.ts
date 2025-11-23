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

// API endpoints
export const API_ENDPOINTS = {
  BASE_URL: 'http://localhost:8000/api',
  CALCULATE_WITH_RECOMMENDATIONS: '/stock/calculate-with-recommendations',
} as const;

// Extension-specific constants
export const EXTENSION_CONFIG = {
  POPUP_WIDTH: 400,
  POPUP_HEIGHT: 600,
  DEBOUNCE_DELAY: 300,
} as const;
