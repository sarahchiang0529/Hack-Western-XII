/**
 * Shared TypeScript types for the Chrome extension
 */

// Storage data structure
export interface StorageData {
  count?: number;
  girlMathProfile?: OnboardingData;
  onboardingComplete?: boolean;
  // Add more storage fields as needed
}

// Onboarding types
export type RiskProfile = "safe" | "balanced" | "mainCharacter";
export type Timeline = "short" | "mid" | "long";
export type Focus = "impulse" | "confidence" | "future" | "goal";

export interface OnboardingData {
  riskProfile: RiskProfile | null;
  timeline: Timeline | null;
  focus: Focus | null;
  specificGoal: string;
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

//backend API response types
export interface StockQuote {
  ticker: string;
  price: number;
  company_name: string;
  sector: string;
  sustainability_score: string; 
}

export interface GirlMathRecommendationResponse {
    main_blurb: string;
    ticker: string;
    item_price: number;
    years_ago: number;
    historical_stock_price: number;
    current_stock_price: number;
    shares_bought: number;
    current_value: number;
    profit_loss: number;
    percent_gain: number;
    is_free: boolean;
    years_until_free: number;
    growth_rate_percentage: number;
    approach: string;
    goal: string;
    horizon: string;
    shopping_site: string;
    timestamp: string;
}