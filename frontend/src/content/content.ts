/**
 * Content Script
 * Detects checkout/cart pages and injects onboarding or investment perspective popup
 */

import type {
  Message,
  MessageResponse,
  OnboardingData,
  RiskProfile,
  Timeline,
  Focus,
} from "@/shared/types";
import { API_ENDPOINTS } from "@/shared/constants";

// ========================================
// Constants
// ========================================
const CHECKOUT_URL_PATTERNS = [
  /\/checkout/i,
  /\/cart/i,
  /\/basket/i,
  /\/bag/i,
  /\/shopping-cart/i,
  /\/shoppingcart/i,
  /\/payment/i,
  /\/review/i,
  /\/order/i,
  /checkout/i,
];

const CHECKOUT_SELECTORS = [
  '[data-testid*="checkout"]',
  '[data-testid*="cart"]',
  '[class*="checkout"]',
  '[class*="cart"]',
  '[id*="checkout"]',
  '[id*="cart"]',
  '[id*="basket"]',
  'form[action*="checkout"]',
  'form[action*="cart"]',
];

const PRICE_SELECTORS = [
  '[class*="total"]',
  '[class*="subtotal"]',
  '[class*="amount"]',
  '[id*="total"]',
  '[id*="subtotal"]',
  '[data-testid*="total"]',
  '[data-testid*="subtotal"]',
];

const ONBOARDING_STEPS = {
  riskProfile: {
    title: "What's your investment approach?",
    subtitle: "This helps us personalize your perspective",
    options: [
      { value: "safe", label: "Conservative", emoji: "🛡️" },
      { value: "balanced", label: "Balanced", emoji: "⚖️" },
      { value: "mainCharacter", label: "Aggressive", emoji: "📈" },
    ],
  },
  timeline: {
    title: "What's your time horizon?",
    subtitle: "When are you planning to use this money?",
    options: [
      { value: "short", label: "Short-term (0-2 years)", emoji: "⏰" },
      { value: "mid", label: "Mid-term (2-5 years)", emoji: "📅" },
      { value: "long", label: "Long-term (5+ years)", emoji: "🔮" },
    ],
  },
  focus: {
    title: "What's your main goal?",
    subtitle: "We'll tailor your perspective",
    options: [
      { value: "impulse", label: "Reduce impulse buys", emoji: "🛍️" },
      { value: "confidence", label: "Build investing confidence", emoji: "💪" },
      { value: "future", label: "Understand my financial future", emoji: "🔭" },
      { value: "goal", label: "Save for a specific goal", emoji: "🎯" },
    ],
  },
} as const;

// ========================================
// State
// ========================================
let popupPanel: HTMLElement | null = null;
let isPanelVisible = false;
let userDismissedPopup = false;
let onboardingStep = 1;

let onboardingData: OnboardingData = {
  riskProfile: null,
  timeline: null,
  focus: null,
  specificGoal: "",
};

// ========================================
// Utility Functions
// ========================================
function log(message: string, data?: unknown): void {
  console.log(`[Girl Math] ${message}`, data ?? "");
}

function isCheckoutPage(): boolean {
  const url = window.location.href.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();

  for (const pattern of CHECKOUT_URL_PATTERNS) {
    if (pattern.test(url) || pattern.test(pathname)) {
      log("Checkout detected via URL pattern", pattern);
      return true;
    }
  }

  for (const selector of CHECKOUT_SELECTORS) {
    try {
      if (document.querySelectorAll(selector).length > 0) {
        log("Checkout detected via DOM selector", selector);
        return true;
      }
    } catch {
      // ignore invalid selector
    }
  }

  const title = document.title.toLowerCase();
  if (title.includes("checkout") || title.includes("cart") || title.includes("basket")) {
    log("Checkout detected via page title");
    return true;
  }

  return false;
}

function extractCartTotal(): number | null {
  // First, try to find "Estimated Total" specifically (highest priority)
  const totalKeywords = ['estimated total', 'order total', 'cart total', 'total'];
  
  for (const keyword of totalKeywords) {
    try {
      // Look for elements containing the keyword
      const elements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = (el.textContent || '').toLowerCase();
        return text.includes(keyword) && text.includes('$');
      });
      
      for (const el of elements) {
        const text = el.textContent || '';
        // Skip if this looks like a payment installment (e.g., "4 payments of $X")
        if (/payments?\s+of|installment|klarna|afterpay|split/i.test(text)) {
          continue;
        }
        
        // Match price patterns like $181.94, prioritizing the largest number in the element
        const priceMatches = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g);
        if (priceMatches && priceMatches.length > 0) {
          const prices = priceMatches
            .map(m => parseFloat(m.replace(/[$,]/g, '')))
            .filter(p => p > 0 && p < 100000);
          
          if (prices.length > 0) {
            // Take the largest price from this element (usually the total, not subtotal)
            const price = Math.max(...prices);
            log(`Found cart total via keyword "${keyword}": $${price}`);
            return price;
          }
        }
      }
    } catch {
      // continue
    }
  }
  
  // Second: try PRICE_SELECTORS but prioritize elements with "total" in their class/id
  for (const selector of PRICE_SELECTORS) {
    try {
      for (const el of document.querySelectorAll(selector)) {
        const text = el.textContent || "";
        const classId = (el.className || '') + ' ' + (el.id || '');
        const isTotalElement = /total|subtotal|amount/i.test(classId);
        
        // Skip payment installments
        if (/payments?\s+of|installment|klarna|afterpay|split/i.test(text)) {
          continue;
        }
        
        // Prioritize elements with "total" in class/id (but not "subtotal")
        if ((isTotalElement && !/subtotal/i.test(classId)) || selector.includes('total')) {
          const priceMatches = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g);
          if (priceMatches && priceMatches.length > 0) {
            const prices = priceMatches
              .map(m => parseFloat(m.replace(/[$,]/g, '')))
              .filter(p => p > 0 && p < 100000);
            
            if (prices.length > 0) {
              // Take the largest price (the total, not subtotal)
              const price = Math.max(...prices);
              log(`Found cart total via selector "${selector}": $${price}`);
              return price;
            }
          }
        }
      }
    } catch {
      // continue
    }
  }
  
  // Last resort: find all prices, exclude payment installments, take the largest reasonable one
  const allText = document.body.textContent || "";
  const priceMatches = allText.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g);
  if (priceMatches?.length) {
    // Get context around each price to filter out installments
    const pricesWithContext: Array<{price: number, context: string}> = [];
    
    for (let i = 0; i < priceMatches.length; i++) {
      const match = priceMatches[i];
      const price = parseFloat(match.replace(/[$,]/g, ''));
      if (price > 0 && price < 100000) {
        // Get surrounding text to check for payment keywords
        const matchIndex = allText.indexOf(match);
        const context = allText.substring(Math.max(0, matchIndex - 50), Math.min(allText.length, matchIndex + 50)).toLowerCase();
        
        // Skip if it's a payment installment
        if (!/payments?\s+of|installment|klarna|afterpay|split/i.test(context)) {
          pricesWithContext.push({price, context});
        }
      }
    }
    
    if (pricesWithContext.length > 0) {
      // Sort by price descending and take the largest (usually the cart total)
      pricesWithContext.sort((a, b) => b.price - a.price);
      const selectedPrice = pricesWithContext[0].price;
      log(`Found cart total via fallback: $${selectedPrice}`);
      return selectedPrice;
    }
  }

  return null;
}

function extractBrandName(): string {
  // First priority: Extract from URL/domain name
  try {
    const hostname = window.location.hostname.replace('www.', '').split('.')[0];
    if (hostname && hostname.length > 2) {
      // Capitalize first letter
      const brandFromUrl = hostname.charAt(0).toUpperCase() + hostname.slice(1);
      log(`Found brand from URL: ${brandFromUrl}`);
      return brandFromUrl;
    }
  } catch {
    // continue
  }

  // Second priority: Look in navbar/header for logo or brand name
  const headerSelectors = [
    'header [class*="logo"]',
    'header [class*="brand"]',
    'nav [class*="logo"]',
    'nav [class*="brand"]',
    '[class*="navbar"] [class*="logo"]',
    '[class*="header"] [class*="logo"]',
    '[id*="logo"]',
    '[class*="site-logo"]',
    'header h1',
    'header a[href="/"]',
    'nav a[href="/"]',
  ];

  for (const selector of headerSelectors) {
    try {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        const text = (el.textContent || '').trim();
        const alt = (el as HTMLElement).getAttribute('alt') || '';
        const title = (el as HTMLElement).getAttribute('title') || '';
        
        // Check alt/title attributes first (common for logos)
        const brandSource = alt || title || text;
        if (brandSource && brandSource.length > 2 && brandSource.length < 50) {
          // Extract brand name (usually first word, capitalized)
          const brandMatch = brandSource.match(/^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,1})/);
          if (brandMatch) {
            const brand = brandMatch[1];
            // Skip common non-brand words
            const skipWords = ['Home', 'Logo', 'Menu', 'Navigation', 'Search', 'Cart', 'Account'];
            if (!skipWords.includes(brand)) {
              log(`Found brand from header/navbar "${selector}": ${brand}`);
              return brand;
            }
          }
        }
      }
    } catch {
      // continue
    }
  }

  // Third priority: Try to find brand name from common e-commerce patterns
  const brandSelectors = [
    '[class*="brand"]',
    '[data-brand]',
    '[itemprop="brand"]',
    '[class*="product-brand"]',
    '[class*="brand-name"]',
  ];

  for (const selector of brandSelectors) {
    try {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        const text = (el.textContent || '').trim();
        // Look for brand names (usually 1-3 words, capitalized)
        const brandMatch = text.match(/^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,2})/);
        if (brandMatch && brandMatch[1].length > 2 && brandMatch[1].length < 50) {
          // Skip extension-related words
          const skipWords = ['WoWie', 'Girl', 'Math', 'Investment'];
          if (!skipWords.includes(brandMatch[1])) {
            log(`Found brand via selector "${selector}": ${brandMatch[1]}`);
            return brandMatch[1];
          }
        }
      }
    } catch {
      // continue
    }
  }

  // Fallback: try to extract from page title
  const title = document.title;
  const titleMatch = title.match(/^([A-Z][a-zA-Z]+)/);
  if (titleMatch) {
    const brand = titleMatch[1];
    // Skip common non-brand words
    const skipWords = ['Checkout', 'Cart', 'Basket', 'Shipping', 'Delivery', 'Order'];
    if (!skipWords.includes(brand)) {
      log(`Found brand from page title: ${brand}`);
      return brand;
    }
  }

  // Last resort: use "purchase" without brand
  log("Could not extract brand name, using generic term");
  return "purchase";
}

function getUserProfile(): Promise<OnboardingData | null> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["girlMathProfile", "onboardingComplete"], (result) => {
      resolve(result.onboardingComplete && result.girlMathProfile ? result.girlMathProfile : null);
    });
  });
}

function saveOnboardingData(): void {
  chrome.storage.sync.set(
    { girlMathProfile: onboardingData, onboardingComplete: true },
    () => checkAndShowPanel(),
  );
}

interface InvestmentData {
  returnPercent: number;
  futureValue: number;
  stock: string;
  mainBlurb: string;
  yearsAgo: number;
  historicalPrice: number;
  currentPrice: number;
}

function mapRiskProfileToApproach(riskProfile: RiskProfile | null): "conservative" | "balanced" | "aggressive" {
  switch (riskProfile) {
    case "safe":
      return "conservative";
    case "balanced":
      return "balanced";
    case "mainCharacter":
      return "aggressive";
    default:
      return "balanced";
  }
}

function mapTimelineToHorizon(timeline: Timeline | null): string {
  switch (timeline) {
    case "short":
      return "short";
    case "mid":
      return "medium";
    case "long":
      return "long";
    default:
      return "medium";
  }
}

function mapFocusToGoal(focus: Focus | null): "emergency" | "travel" | "future_home" | "long_term_wealth" | "other" {
  switch (focus) {
    case "impulse":
      return "emergency";
    case "confidence":
      return "long_term_wealth";
    case "future":
      return "future_home";
    case "goal":
      return "other";
    default:
      return "other";
  }
}

async function calculateInvestment(
  cartTotal: number,
  profile: OnboardingData | null
): Promise<InvestmentData> {
  try {
    const approach = mapRiskProfileToApproach(profile?.riskProfile || null);
    const horizon = mapTimelineToHorizon(profile?.timeline || null);
    const goal = mapFocusToGoal(profile?.focus || null);
    const shoppingSite = new URL(window.location.href).hostname.replace("www.", "");

    const requestBody = {
      item_price: cartTotal,
      approach: approach,
      goal: goal,
      horizon: horizon,
      shopping_site: shoppingSite,
      cart_total: cartTotal,
    };

    log("Calling backend API", { 
      url: `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.CALCULATE_WITH_RECOMMENDATIONS}`, 
      body: requestBody 
    });

    // Add timeout to fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      log("Fetch timeout - aborting request");
    }, 10000); // 10 second timeout

    let response;
    try {
      log("Starting fetch request...");
      response = await fetch(
        `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.CALCULATE_WITH_RECOMMENDATIONS}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);
      log("Fetch completed", { status: response.status, ok: response.ok });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        const errorMsg = "Request timeout: Backend did not respond within 10 seconds. Make sure the backend is running at http://localhost:8000";
        log("Backend timeout", { error: errorMsg });
        throw new Error(errorMsg);
      }
      // Log network errors for debugging
      const errorMsg = fetchError instanceof Error ? fetchError.message : String(fetchError);
      log("Network error calling backend", { error: errorMsg });
      throw fetchError;
    }

    if (!response.ok) {
      const errorText = await response.text();
      log("API error response", { status: response.status, statusText: response.statusText, body: errorText });
      throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    log("API response received", data);

    return {
      returnPercent: Math.round(data.percent_gain * 10) / 10,
      futureValue: Math.round(data.current_value * 100) / 100,
      stock: data.ticker,
      mainBlurb: data.main_blurb || "",
      yearsAgo: data.years_ago || 5,
      historicalPrice: data.historical_stock_price || 0,
      currentPrice: data.current_stock_price || 0,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Log the error for debugging
    console.error("[Girl Math] API call failed:", errorMessage);
    log("API call failed, using fallback values", { 
      error: errorMessage,
      url: `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.CALCULATE_WITH_RECOMMENDATIONS}`,
      cartTotal 
    });
    
    // Only use fallback if it's a network error or backend is unavailable
    // If it's a validation error (400), we should show the error to the user
    if (errorMessage.includes("400") || errorMessage.includes("API error")) {
      // For validation errors, still use fallback but log the issue
      console.warn("[Girl Math] Backend returned validation error, using fallback");
    }
    
    // Fallback to hardcoded values if API fails
    return {
      returnPercent: 30,
      futureValue: Math.round(cartTotal * 1.3 * 100) / 100,
      stock: "NVDA",
      mainBlurb: `${cartTotal.toFixed(2)} in NVDA last 5 years would be ~${Math.round(cartTotal * 1.3 * 100) / 100} today. That's 30% growth.`,
      yearsAgo: 5,
      historicalPrice: 0,
      currentPrice: 0,
    };
  }
}

function canProceedOnboarding(): boolean {
  const stepFields = [onboardingData.riskProfile, onboardingData.timeline, onboardingData.focus];
  return stepFields[onboardingStep - 1] !== null;
}

// ========================================
// Popup Management
// ========================================
function removePopup(): void {
  if (popupPanel) {
    popupPanel.remove();
    popupPanel = null;
    isPanelVisible = false;
  }
}

function appendPopupToBody(): void {
  if (document.body && popupPanel) {
    document.body.appendChild(popupPanel);
    isPanelVisible = true;
  } else {
    setTimeout(() => {
      if (document.body && popupPanel) {
        document.body.appendChild(popupPanel);
        isPanelVisible = true;
      }
    }, 500);
  }
}

function createPopupHeader(title: string, subtitle: string): string {
  return `
    <div class="girl-math-popup-header">
      <div class="girl-math-popup-title-subtitle-wrapper">
        <h3 class="girl-math-popup-title">${title}</h3>
        <div class="girl-math-popup-subtitle">${subtitle}</div>
      </div>
      <button class="girl-math-popup-close" aria-label="Close">×</button>
    </div>
  `;
}

function createOptionButton(
  value: string,
  label: string,
  emoji: string,
  isSelected: boolean,
): string {
  return `
    <button class="girl-math-option-button ${isSelected ? "selected" : ""}" data-value="${value}">
      <span class="girl-math-option-emoji">${emoji}</span>
      <span>${label}</span>
    </button>
  `;
}

// ---------- Investment popup ----------
async function createInvestmentPopup(cartTotal: number, profile: OnboardingData | null): Promise<void> {
  removePopup();

  // Show loading state
  popupPanel = document.createElement("div");
  popupPanel.id = "girl-math-popup-panel";
  popupPanel.innerHTML = `
    ${createPopupHeader("Girl Math", "Investment Perspective")}
    <div class="girl-math-popup-content">
      <div style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 14px; color: var(--girl-math-text-primary);">Calculating...</div>
      </div>
    </div>
  `;
  appendPopupToBody();

  try {
    const investment = await calculateInvestment(cartTotal, profile);
    const formattedTotal = `$${cartTotal.toFixed(2)}`;
    const formattedFuture = `$${investment.futureValue.toFixed(2)}`;

    // Remove loading popup and create first view (Oprah GIF card)
    removePopup();
    popupPanel = document.createElement("div");
    popupPanel.id = "girl-math-popup-panel";
    popupPanel.className = "wowie-popup-stage-1";

    // Get the GIF URL using chrome.runtime.getURL
    const gifUrl = chrome.runtime.getURL('assets/oprah-winfrey.gif');
    log("GIF URL:", gifUrl);

    popupPanel.innerHTML = `
      ${createPopupHeader("WoWie", "Investment Perspective")}
      <div class="girl-math-popup-content wowie-card-content">
        <!-- Oprah GIF Section -->
        <div class="wowie-oprah-section">
          <div class="wowie-oprah-image-container">
            <img id="wowie-oprah-gif" src="${gifUrl}" alt="Oprah WOW" class="wowie-oprah-gif" 
                 style="display: block; width: 100%; height: auto;" />
            <div id="wowie-oprah-placeholder" class="wowie-oprah-placeholder" style="display: none;">
              <div class="wowie-wow-text">WOW</div>
            </div>
          </div>
          <div class="wowie-question-text">
            Girl... What happened to becoming a WoW?
          </div>
          <div class="wowie-footnote">
            *Woman of Wealth.
          </div>
        </div>
      </div>
    `;

    setupPopupCloseButton();
    appendPopupToBody();

    // Wait for DOM to be ready, then set up GIF tracking
    setTimeout(() => {
      const gifElement = popupPanel?.querySelector('#wowie-oprah-gif') as HTMLImageElement;
      const placeholderElement = popupPanel?.querySelector('#wowie-oprah-placeholder') as HTMLElement;
      
      // Define transition function - restore original investment popup design
      const transitionToInvestmentView = () => {
        if (!popupPanel) return;
        
        // Calculate 6 months ago values for WoWie design
        const monthsAgo = 6;
        let historicalPrice6Months: number;
        let currentPrice: number;
        
        if (investment.currentPrice > 0 && investment.historicalPrice > 0) {
          // Estimate 6-month values based on the growth rate
          const yearsGrowth = investment.currentPrice / investment.historicalPrice;
          const monthlyGrowth = Math.pow(yearsGrowth, 1 / (investment.yearsAgo * 12));
          const sixMonthGrowth = Math.pow(monthlyGrowth, 6);
          historicalPrice6Months = investment.currentPrice / sixMonthGrowth;
          currentPrice = investment.currentPrice;
        } else {
          // Fallback values
          historicalPrice6Months = 152.89;
          currentPrice = 354.65;
        }
        
        const investmentAmount6Months = cartTotal;
        const futureValue6Months = Math.round((investmentAmount6Months * (currentPrice / historicalPrice6Months)) * 100) / 100;
        const growthPercent6Months = Math.round(((currentPrice / historicalPrice6Months - 1) * 100) * 10) / 10;
        
        // Format the cart total for display
        const formattedCartTotal = `$${cartTotal.toFixed(2)}`;
        
        // Transition to WoWie investment view design
        popupPanel.className = "";
        popupPanel.innerHTML = `
          ${createPopupHeader("WoWie", "Investment Perspective")}
          <div class="girl-math-popup-content wowie-investment-content">
            <!-- Introductory Text -->
            <div class="wowie-intro-text">
              If you invested <strong>${formattedCartTotal}</strong> into ${investment.stock} ${monthsAgo} months ago, you would've made
            </div>
            
            <!-- Large Amount --> 
            <div class="wowie-large-amount">$${futureValue6Months.toFixed(2)}</div>
            
            <!-- Separator Line -->
            <div class="wowie-separator"></div>
            
            <!-- Growth Explanation Box -->
            <div class="wowie-explanation-box">
              <strong>$${investmentAmount6Months.toFixed(2)}</strong> in ${investment.stock} ${monthsAgo} months ago is <strong>$${currentPrice.toFixed(2)}</strong> today. That's <strong>${growthPercent6Months}%</strong> growth.
            </div>
            
            <!-- Return and Future Value Boxes -->
            <div class="wowie-comparison-boxes">
              <div class="wowie-comparison-box">
                <div class="wowie-comparison-label">Return</div>
                <div class="wowie-comparison-value">${growthPercent6Months}%</div>
              </div>
              <div class="wowie-comparison-box">
                <div class="wowie-comparison-label">Future Value</div>
                <div class="wowie-comparison-value">$${futureValue6Months.toFixed(2)}</div>
              </div>
            </div>
            
            <!-- Concluding Message -->
            <div class="wowie-conclusion">
              You can still make your ${extractBrandName()} purchase. But don't forget to grow some cash too. Just a cute reminder for your long-term wealth era <3
            </div>
          </div>
        `;

        setupPopupCloseButton();
      };
      
      // Set up GIF loop tracking
      // The GIF will play once before transitioning to the investment view
      // Adjust this duration to match your GIF's exact loop time (in milliseconds)
      const totalDuration = 1000; // Duration for one complete GIF loop
      
      // Add error handler for GIF loading
      if (gifElement) {
        gifElement.addEventListener('error', (e) => {
          log("GIF failed to load. URL attempted:", gifUrl);
          log("Make sure the GIF file exists at: frontend/public/assets/oprah-winfrey.gif");
          console.error("GIF load error:", e);
          
          // Show placeholder if GIF fails to load
          gifElement.style.display = 'none';
          if (placeholderElement) {
            placeholderElement.style.display = 'flex';
          }
        });
        
        gifElement.addEventListener('load', () => {
          log("GIF loaded successfully!");
          if (placeholderElement) {
            placeholderElement.style.display = 'none';
          }
        });
        
        // Track GIF duration and transition after one loop
        let startTime = Date.now();
        
        const checkLoop = setInterval(() => {
          const elapsed = Date.now() - startTime;
          if (elapsed >= totalDuration) {
            clearInterval(checkLoop);
            transitionToInvestmentView();
          }
        }, 100); // Check every 100ms
        
        // Fallback timeout
        setTimeout(() => {
          clearInterval(checkLoop);
          transitionToInvestmentView();
        }, totalDuration + 500); // Add 500ms buffer
      } else {
        log("ERROR: Could not find GIF element in DOM");
        // Fallback: if GIF element not found, show investment view after delay
        setTimeout(transitionToInvestmentView, totalDuration + 1000);
      }
    }, 100);
  } catch (error) {
    log("Error creating investment popup", error);
    // On error, show a simple error message
    removePopup();
    popupPanel = document.createElement("div");
    popupPanel.id = "girl-math-popup-panel";
    popupPanel.innerHTML = `
      ${createPopupHeader("Girl Math", "Investment Perspective")}
      <div class="girl-math-popup-content">
        <div style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 14px; color: var(--girl-math-text-primary);">
            Unable to calculate investment. Please try again later.
          </div>
        </div>
      </div>
    `;
    setupPopupCloseButton();
    appendPopupToBody();
  }
}

// ---------- Onboarding popup ----------
function createOnboardingPopup(): void {
  removePopup();

  popupPanel = document.createElement("div");
  popupPanel.id = "girl-math-popup-panel";

  const stepKey = (
    onboardingStep === 1 ? "riskProfile" : onboardingStep === 2 ? "timeline" : "focus"
  ) as keyof typeof ONBOARDING_STEPS;

  const stepData = ONBOARDING_STEPS[stepKey];
  const progress = (onboardingStep / 3) * 100;
  const currentValue = (onboardingData as any)[stepKey];

  popupPanel.innerHTML = `
    ${createPopupHeader("Complete Setup", `Step ${onboardingStep} of 3`)}
    <div class="girl-math-popup-content">
      <div class="girl-math-progress">
        <div class="girl-math-progress-bar" style="width: ${progress}%"></div>
      </div>
      
      <div class="girl-math-onboarding-step active">
        <h4 class="girl-math-onboarding-title">${stepData.title}</h4>
        <p class="girl-math-onboarding-subtitle">${stepData.subtitle}</p>
        ${stepData.options
          .map((opt) => createOptionButton(opt.value, opt.label, opt.emoji, currentValue === opt.value))
          .join("")}
        ${
          onboardingStep === 3 && onboardingData.focus === "goal"
            ? `
          <input 
            type="text" 
            class="girl-math-onboarding-input" 
            placeholder="e.g., Trip to Korea" 
            value="${onboardingData.specificGoal}"
            id="girl-math-goal-input"
          />
        `
            : ""
        }
      </div>
      
      <div class="girl-math-onboarding-nav">
        ${
          onboardingStep > 1
            ? `
          <button class="girl-math-nav-button girl-math-nav-button-secondary" id="girl-math-back">
            Back
          </button>
        `
            : ""
        }
        <button 
          class="girl-math-nav-button girl-math-nav-button-primary" 
          id="girl-math-next"
          ${!canProceedOnboarding() ? "disabled" : ""}
        >
          ${onboardingStep === 3 ? "Complete Setup" : "Next"}
        </button>
      </div>
    </div>
  `;

  setupPopupCloseButton();
  setupOnboardingEventListeners();
  appendPopupToBody();
}

// ========================================
// Event wiring helpers
// ========================================
function setupPopupCloseButton(): void {
  const closeBtn = popupPanel?.querySelector(".girl-math-popup-close");
  closeBtn?.addEventListener("click", dismissPopupPanel);
}

function setupOnboardingEventListeners(): void {
  const optionButtons = popupPanel?.querySelectorAll(".girl-math-option-button");
  optionButtons?.forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.getAttribute("data-value");
      if (!value) return;

      if (onboardingStep === 1) {
        onboardingData.riskProfile = value as RiskProfile;
      } else if (onboardingStep === 2) {
        onboardingData.timeline = value as Timeline;
      } else if (onboardingStep === 3) {
        onboardingData.focus = value as Focus;
        if (value === "goal") {
          createOnboardingPopup();
          return;
        }
      }

      optionButtons.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");

      const nextBtn = popupPanel?.querySelector("#girl-math-next") as HTMLButtonElement;
      if (nextBtn) nextBtn.disabled = false;
    });
  });

  const goalInput = popupPanel?.querySelector("#girl-math-goal-input") as HTMLInputElement;
  goalInput?.addEventListener("input", (e) => {
      onboardingData.specificGoal = (e.target as HTMLInputElement).value;
    });

  popupPanel
    ?.querySelector("#girl-math-back")
    ?.addEventListener("click", () => {
    onboardingStep = Math.max(1, onboardingStep - 1);
    createOnboardingPopup();
  });

  popupPanel
    ?.querySelector("#girl-math-next")
    ?.addEventListener("click", () => {
    if (!canProceedOnboarding()) return;
    if (onboardingStep < 3) {
      onboardingStep++;
      createOnboardingPopup();
    } else {
      saveOnboardingData();
    }
  });
}

// ========================================
// Show / hide
// ========================================
function hidePopupPanel(): void {
  if (popupPanel) {
    popupPanel.style.animation = "slideInRight 0.3s ease-out reverse";
    setTimeout(() => {
      removePopup();
    }, 300);
  }
}

function dismissPopupPanel(): void {
  userDismissedPopup = true;
  hidePopupPanel();
}

function resetDismissalFlag(): void {
  userDismissedPopup = false;
}

// ========================================
// Main logic: should we show anything?
// ========================================
async function checkAndShowPanel(): Promise<void> {
  const isCheckout = isCheckoutPage();
  log("Checking page", {
    url: window.location.href,
    isCheckout,
    isPanelVisible,
    userDismissedPopup,
  });

  if (!isCheckout) {
    if (isPanelVisible) hidePopupPanel();
    resetDismissalFlag();
    return;
  }

  if (userDismissedPopup || isPanelVisible) {
    log(userDismissedPopup ? "Popup was dismissed by user" : "Panel already visible");
    return;
  }

  const profile = await getUserProfile();
  const isOnboardingComplete = !!(profile?.riskProfile && profile?.timeline && profile?.focus);

  log("Profile check", { hasProfile: !!profile, isOnboardingComplete });

  if (isOnboardingComplete) {
    const cartTotal = extractCartTotal() || 120;
    log("Creating investment popup", { cartTotal });
    createInvestmentPopup(cartTotal, profile);
  } else {
    log("Creating onboarding popup");
    onboardingStep = 1;
    onboardingData = { riskProfile: null, timeline: null, focus: null, specificGoal: "" };
    createOnboardingPopup();
  }
}

// ========================================
// Message Handler
// ========================================
chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse: (response: MessageResponse) => void) => {
    switch (message.type) {
      case "GET_DATA":
        sendResponse({
          success: true,
          data: {
          title: document.title,
          url: window.location.href,
          isCheckout: isCheckoutPage(),
          },
        });
        break;
      default:
        sendResponse({ success: false, error: "Unknown message type" });
    }
    return true;
  },
);

// ========================================
// Initialization
// ========================================
function init(): void {
  log("Content script initialized", window.location.href);

  setTimeout(checkAndShowPanel, 1000);

  let lastUrl = window.location.href;
  const urlObserver = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      log("URL changed", window.location.href);
      resetDismissalFlag();
      setTimeout(checkAndShowPanel, 1000);
    }
  });

  if (document.body) {
    urlObserver.observe(document.body, { childList: true, subtree: true });
  }

  window.addEventListener("popstate", () => {
    log("Popstate event");
    resetDismissalFlag();
    setTimeout(checkAndShowPanel, 1000);
  });

  setInterval(() => {
    if (!isPanelVisible && !userDismissedPopup) {
      checkAndShowPanel();
    }
  }, 3000);
}

// DOM Ready Handlers
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    log("DOMContentLoaded fired");
    init();
  });
} else {
  log("DOM already ready, initializing immediately");
  init();
}

setTimeout(() => {
  if (!isPanelVisible && isCheckoutPage()) {
    log("Fallback initialization triggered");
    checkAndShowPanel();
  }
}, 2000);