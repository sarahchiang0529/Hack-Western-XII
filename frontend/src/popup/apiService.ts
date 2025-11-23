// In src/apiService.ts (New File)

import { API_ENDPOINTS } from 'src/shared/constants';
import { 
  StockQuote, 
  GirlMathRecommendationResponse 
} from 'src/shared/types'; 

// type for the request body for Girl Math
export interface GirlMathRequest {
    item_price: number;
    years_ago: number;
    approach: string; // map from RiskProfile
    goal: string;     // map from SpecificGoal
    horizon: string;  // map from Timeline
    shopping_site: string;
    cart_total: number;
}


// ESG STOCKS: GET /stock/esg
export async function fetchEsgStocks(): Promise<StockQuote[]> {
  try {
    const response = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.GET_ESG_STOCKS}`);

    if (!response.ok) {
      throw new Error(`Error fetching ESG stocks: ${response.statusText}`);
    }

    // returns an array of StockQuote objects
    const data: StockQuote[] = await response.json();
    return data;
  } catch (error) {
    console.error("API Error: fetchEsgStocks failed.", error);
    // returns an empty array on failure
    return []; 
  }
}


// GIRL MATH: POST /stock/calculate_recommendation
export async function fetchGirlMathRecommendation(
  requestBody: GirlMathRequest
): Promise<GirlMathRecommendationResponse | null> {
  try {
    const response = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.GIRL_MATH_RECOMMENDATION}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (response.status === 400) {
        
        const errorDetail = await response.json();
        throw new Error(errorDetail.detail || "Invalid input or data unavailable.");
    }
    if (!response.ok) {
        throw new Error(`HTTP Error: Status ${response.status}`);
    }

    // returns the full recommendation object
    const result: GirlMathRecommendationResponse = await response.json();
    return result;
  } catch (error) {
    console.error("API Error: fetchGirlMathRecommendation failed.", error);
    // returns null or re-throw the error for the component to handle
    throw error;
  }
}


// STOCK PRICE: GET /stock/price/{ticker}
export async function fetchStockPrice(ticker: string): Promise<StockQuote | null> {
  try {
    const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.GET_STOCK_PRICE}/${ticker}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error fetching stock price: ${response.statusText}`);
    }

    // returns a single StockQuote object
    const data: StockQuote = await response.json();
    return data;
  } catch (error) {
    console.error(`API Error: fetchStockPrice for ${ticker} failed.`, error);
    return null;
  }
}