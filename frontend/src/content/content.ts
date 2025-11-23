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
  for (const selector of PRICE_SELECTORS) {
    try {
      for (const el of document.querySelectorAll(selector)) {
        const text = el.textContent || "";
        const priceMatch = text.match(/\$?(\d+\.?\d*)/);
        if (priceMatch) {
          const price = parseFloat(priceMatch[1]);
          if (price > 0 && price < 100000) return price;
        }
      }
    } catch {
      // continue
    }
  }

  const allText = document.body.textContent || "";
  const priceMatches = allText.match(/\$(\d+\.?\d*)/g);
  if (priceMatches?.length) {
    const prices = priceMatches.map((m) => parseFloat(m.replace("$", "")));
    const maxPrice = Math.max(...prices);
    if (maxPrice > 0 && maxPrice < 100000) return maxPrice;
  }

  return null;
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

function calculateInvestment(cartTotal: number) {
  const returnPercent = 30;
  return {
    returnPercent,
    futureValue: Math.round(cartTotal * 1.3 * 100) / 100,
    stock: "NVDA",
  };
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
      <div>
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
function createInvestmentPopup(cartTotal: number): void {
  removePopup();

  const investment = calculateInvestment(cartTotal);
  const formattedTotal = `$${cartTotal.toFixed(2)}`;
  const formattedFuture = `$${investment.futureValue.toFixed(2)}`;

  popupPanel = document.createElement("div");
  popupPanel.id = "girl-math-popup-panel";

  popupPanel.innerHTML = `
    ${createPopupHeader("Girl Math", "Investment Perspective")}
    <div class="girl-math-popup-content">
      <!-- Cart Total Section -->
      <div class="girl-math-cart-total">
        <div class="girl-math-cart-total-label">CART TOTAL</div>
        <div class="girl-math-cart-total-amount">${formattedTotal}</div>
      </div>
      
      <!-- Stock Info -->
      <div class="girl-math-stock-info">${investment.stock} Last 5 years</div>

      <!-- Main explanation block -->
      <div class="girl-math-investment-box">
        ${formattedTotal} in ${investment.stock} last 5 years would be ~${formattedFuture} today. That's ${investment.returnPercent}% growth.
      </div>

      <!-- Two stat cards -->
      <div class="girl-math-stats">
        <div class="girl-math-stat-box">
          <div class="girl-math-stat-label">RETURN</div>
          <div class="girl-math-stat-value">+${investment.returnPercent}%</div>
        </div>
        <div class="girl-math-stat-box">
          <div class="girl-math-stat-label">FUTURE VALUE</div>
          <div class="girl-math-stat-value">${formattedFuture}</div>
        </div>
      </div>

      <!-- Bottom message -->
      <div class="girl-math-message">
        You don't have to buy it today. Future you is watching.
      </div>
    </div>
  `;

  setupPopupCloseButton();
  appendPopupToBody();
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
    createInvestmentPopup(cartTotal);
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