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
// (Removed duplicate API_ENDPOINTS declaration)

// Extension-specific constants
export const EXTENSION_CONFIG = {
  POPUP_WIDTH: 400,
  POPUP_HEIGHT: 600,
  DEBOUNCE_DELAY: 300,
} as const;

export const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const API_ENDPOINTS = {
  GIRL_MATH_RECOMMENDATION: `${API_BASE_URL}/stock/calculate_recommendation`,
  GET_ESG_STOCKS: `${API_BASE_URL}/stock/esg`,
  GET_STOCK_PRICE: `${API_BASE_URL}/stock/price`,
} as const;
