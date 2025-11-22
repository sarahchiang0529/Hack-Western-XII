"""
Stock Service - External Data & Logic
This will handle communication with Yahoo Finance and 'Girl Math' Calculations.
"""
from typing import Dict, List, Optional
from datetime import datetime
import uuid
import math
import random
import yfinance as yf

from app.models.stock import GirlMathResponse, GirlMathRecommendationResponse, StockQuote

# Hardcoded stock lists for different investment approaches
APPROACH_STOCKS = {
    "conservative": ["VTI", "VOO", "BND"],
    "balanced": ["VT", "XEQT", "AAPL"],
    "aggressive": ["QQQ", "NVDA", "TSLA"]
}


class StockService:
    """
    Service for fetching market data and calculating investment timelines
    Has simple in-memory caching to prevent API rate limits 
    """
    def __init__(self):
        """Initialize stock service with a simple cache"""
        self._cache: Dict[str, Dict] = {}
        # structure: { 'TICKER': { "data": StockQuote, "timestamp": datetime } }
        self._cache_duration_seconds = 300  # 5min

    def _get_from_cache(self, ticker: str) -> Optional[StockQuote]:
        """checks the valid cache entries"""
        if ticker in self._cache:
            entry = self._cache[ticker]
            age = (datetime.utcnow() - entry['timestamp']).total_seconds()
            if age < self._cache_duration_seconds:
                return entry['data']
        return None
    
    def _calculate_historical_growth_rate(self, ticker: str, years: int) -> float:
        """
        Calculate historical Compound Annual Growth Rate (CAGR) for a stock
        
        Args:
            ticker: Stock ticker symbol
            years: Number of years to look back (1-10)
            
        Returns:
            Growth rate as decimal (e.g., 0.08 for 8%), defaults to 0.08 if calculation fails
        """
        DEFAULT_RATE = 0.08
        
        try:
            print(f"[GROWTH] Calculating {years}-year CAGR for {ticker}")
            
            # Fetch historical data
            stock = yf.Ticker(ticker)
            hist = stock.history(period=f"{years}y")
            
            # Validate we have enough data
            if hist.empty or len(hist) < 2:
                print(f"[GROWTH] Insufficient data for {ticker}, using default {DEFAULT_RATE*100}%")
                return DEFAULT_RATE
            
            # Check if we have at least 80% of expected trading days (~252 per year)
            expected_days = years * 252 * 0.8
            if len(hist) < expected_days:
                print(f"[GROWTH] Only {len(hist)} data points for {ticker} (expected ~{int(expected_days)}), using default")
                return DEFAULT_RATE
            
            # Get start and end prices
            start_price = float(hist['Close'].iloc[0])
            end_price = float(hist['Close'].iloc[-1])
            
            # Validate prices
            if start_price <= 0 or end_price <= 0:
                print(f"[GROWTH] Invalid prices for {ticker}, using default")
                return DEFAULT_RATE
            
            # Calculate actual years in data
            actual_years = (hist.index[-1] - hist.index[0]).days / 365.25
            
            if actual_years < 0.5:  # Need at least 6 months
                print(f"[GROWTH] Insufficient time period ({actual_years:.1f} years), using default")
                return DEFAULT_RATE
            
            # Calculate CAGR: ((ending_value / beginning_value) ^ (1 / years)) - 1
            cagr = ((end_price / start_price) ** (1 / actual_years)) - 1
            
            # Sanity check: growth rate should be between -50% and +100% per year
            if cagr < -0.5 or cagr > 1.0:
                print(f"[GROWTH] Calculated CAGR {cagr*100:.2f}% seems unrealistic, using default")
                return DEFAULT_RATE
            
            print(f"[GROWTH] {ticker} {years}yr CAGR: {cagr*100:.2f}% (${start_price:.2f} → ${end_price:.2f})")
            return cagr
            
        except KeyError as ke:
            print(f"[GROWTH] Missing data field for {ticker}: {ke}, using default")
            return DEFAULT_RATE
        except ValueError as ve:
            print(f"[GROWTH] Value error for {ticker}: {ve}, using default")
            return DEFAULT_RATE
        except Exception as e:
            print(f"[GROWTH] Error calculating growth for {ticker}: {type(e).__name__} - {e}, using default")
            return DEFAULT_RATE
    
    def _generate_blurb(
        self,
        approach: str,
        goal: str,
        horizon: str,
        shopping_site: str,
        cart_total: float,
        ticker: str,
        past_value: float,
        today_value: float,
        percent_gain: float,
        period_years: int
    ) -> str:
        """
        Generate personalized blurb based on approach and goal combination
        
        Args:
            approach: Investment approach (conservative, balanced, aggressive)
            goal: Financial goal (emergency, travel, future_home, long_term_wealth, other)
            horizon: Time horizon (short, medium, long)
            shopping_site: Shopping website name
            cart_total: Cart total amount
            ticker: Stock ticker symbol
            past_value: Historical stock price
            today_value: Current stock price
            percent_gain: Percentage gain
            period_years: Number of years in the analysis
            
        Returns:
            Personalized blurb string
        """
        # Format monetary values
        cart_str = f"${cart_total:.2f}"
        past_str = f"${past_value:.2f}"
        today_str = f"${today_value:.2f}"
        gain_str = f"+{percent_gain:.1f}%" if percent_gain > 0 else f"{percent_gain:.1f}%"
        
        # Base template
        base = f"Girl math but make it finance: your {cart_str} at {shopping_site} could've been a {ticker} moment — {period_years} years ago it was {past_str}, and today it'd be {today_str} ({gain_str} gain)"
        
        # Approach + Goal specific endings
        blurb_endings = {
            ("conservative", "emergency"): f". For your {approach} vibe and {horizon} horizon toward {goal}, this shows how steady growth builds your safety net — but remember, past returns aren't guaranteed.",
            ("conservative", "travel"): f". For your {approach} vibe and {horizon} horizon toward {goal}, it's a cute what-if showing how patience pays… but actual vacations need cash, not just stocks!",
            ("conservative", "future_home"): f". For your {approach} vibe and {horizon} horizon toward {goal}, this steady approach could've helped with that down payment — slow and steady wins the real estate race.",
            ("conservative", "long_term_wealth"): f". For your {approach} vibe and {horizon} horizon toward {goal}, it shows how playing it safe can still build wealth over time — boring but effective!",
            ("conservative", "other"): f". For your {approach} vibe and {horizon} horizon, it's a gentle reminder that stability and growth can coexist — just at a chill pace.",
            
            ("balanced", "emergency"): f". For your {approach} vibe and {horizon} horizon toward {goal}, it's a cute what-if showing balanced growth for security — but keep some cash handy too!",
            ("balanced", "travel"): f". For your {approach} vibe and {horizon} horizon toward {goal}, it's a cute what-if… instead of buying from {shopping_site} today, you could've been planning that dream trip with these returns.",
            ("balanced", "future_home"): f". For your {approach} vibe and {horizon} horizon toward {goal}, this balanced approach could've gotten you closer to those house keys — not too risky, not too slow.",
            ("balanced", "long_term_wealth"): f". For your {approach} vibe and {horizon} horizon toward {goal}, it shows the sweet spot between safety and growth — perfect for building wealth without the stress.",
            ("balanced", "other"): f". For your {approach} vibe and {horizon} horizon, it's the Goldilocks of investing — not too safe, not too risky, just right for steady gains.",
            
            ("aggressive", "emergency"): f". For your {approach} vibe and {horizon} horizon toward {goal}, this shows the power of bold moves — but emergency funds need stability, not volatility!",
            ("aggressive", "travel"): f". For your {approach} vibe and {horizon} horizon toward {goal}, those gains could've been first-class tickets — high risk, high reward, high adventure!",
            ("aggressive", "future_home"): f". For your {approach} vibe and {horizon} horizon toward {goal}, these bold gains could've been your down payment — but the ride might've been bumpy!",
            ("aggressive", "long_term_wealth"): f". For your {approach} vibe and {horizon} horizon toward {goal}, it's about maximizing gains and accepting the rollercoaster — fortune favors the bold!",
            ("aggressive", "other"): f". For your {approach} vibe and {horizon} horizon, you're playing for big wins — just remember, what goes up fast can come down faster.",
        }
        
        # Get the appropriate ending, fallback to generic if combination not found
        ending = blurb_endings.get(
            (approach.lower(), goal.lower()),
            f". For your {approach} vibe and {horizon} horizon toward {goal}, it's an interesting what-if moment!"
        )
        
        return base + ending
    
    def get_real_time_price(self, ticker: str) -> Optional[StockQuote]:
        """
        Fetches live data from yfinance
        Returns None if the ticker is invalid or data cannot be retrieved
        
        Args:
            ticker: Stock ticker symbol (e.g., 'AAPL', 'MSFT')
            
        Returns:
            StockQuote object with current price and metadata, or None if unavailable
        """
        # Normalize ticker to uppercase
        ticker = ticker.upper().strip()
        
        if not ticker:
            print("Error: Empty ticker provided")
            return None

        # Check cache first to minimize API calls
        cached = self._get_from_cache(ticker)
        if cached:
            print(f"[CACHE HIT] Using cached data for {ticker}")
            return cached
        
        # Fetch from yfinance API
        print(f"[API CALL] Fetching fresh data for {ticker}")
        try:
            stock = yf.Ticker(ticker)
            
            # Get historical price data (more reliable than .info for price)
            hist = stock.history(period="1d")

            # Validate we got data
            if hist.empty:
                print(f"[WARNING] No price data available for {ticker}")
                return None
            
            # Extract the most recent closing price
            current_price = float(hist['Close'].iloc[-1])
            
            # Validate price is reasonable
            if current_price <= 0:
                print(f"[ERROR] Invalid price {current_price} for {ticker}")
                return None

            # Fetch company metadata (this can be slow/incomplete)
            try:
                info = stock.info
            except Exception as info_error:
                print(f"[WARNING] Could not fetch info for {ticker}: {info_error}")
                info = {}

            # Extract metadata with safe defaults
            company_name = info.get('shortName') or info.get('longName') or ticker
            sector = info.get('sector', 'Unknown')
            
            # Handle ESG scores (may not be available for all stocks)
            esg_data = info.get('esgScores', {})
            if isinstance(esg_data, dict):
                total_esg = esg_data.get('totalEsg', 'N/A')
            else:
                total_esg = 'N/A'
            
            sustainability_score = str(total_esg) if total_esg != 'N/A' else 'N/A'

            # Create the StockQuote object
            quote = StockQuote(
                ticker=ticker,
                price=round(current_price, 2),
                company_name=company_name,
                sector=sector,
                sustainability_score=sustainability_score
            )

            # Save to cache for future requests
            self._cache[ticker] = {
                "data": quote,
                "timestamp": datetime.utcnow()
            }
            
            print(f"[SUCCESS] Fetched {ticker}: ${current_price:.2f}")
            return quote
        
        except KeyError as ke:
            print(f"[ERROR] Missing expected data field for {ticker}: {ke}")
            return None
        except ValueError as ve:
            print(f"[ERROR] Data conversion error for {ticker}: {ve}")
            return None
        except Exception as e:
            print(f"[ERROR] Unexpected error fetching data for {ticker}: {type(e).__name__} - {e}")
            return None
        
    def calculate_girl_math(self, ticker: str, item_price: float, years_ago: int = 2) -> Optional[GirlMathResponse]:
        """
        Calculates what your investment would be worth TODAY if you had invested X years ago
        instead of buying the item. Shows current value, profit/loss, and if not yet doubled,
        how many more years until it doubles.
        
        Args:
            ticker: Stock ticker symbol
            item_price: Cost of the item
            years_ago: How many years ago you would have invested (default: 2)
            
        Returns:
            GirlMathResponse with historical analysis and future projection, or None if data unavailable
        """
        print(f"[GIRL MATH] Analyzing: What if I invested ${item_price} in {ticker} {years_ago} years ago?")
        
        try:
            # Get current stock price
            quote = self.get_real_time_price(ticker)
            if not quote:
                return None
            
            current_price = quote.price
            
            # Fetch historical data to get the price X years ago
            stock = yf.Ticker(ticker)
            hist = stock.history(period=f"{years_ago}y")
            
            if hist.empty or len(hist) < 2:
                print(f"[GIRL MATH] Insufficient historical data for {ticker}")
                return None
            
            # Get the price from X years ago (first available price in the period)
            historical_price = float(hist['Close'].iloc[0])
            
            if historical_price <= 0:
                print(f"[GIRL MATH] Invalid historical price for {ticker}")
                return None
            
            # Calculate how many shares could have been bought
            shares_bought = item_price / historical_price
            
            # Calculate current value of those shares
            current_value = shares_bought * current_price
            
            # Calculate profit/loss
            profit_loss = current_value - item_price
            percent_gain = ((current_value - item_price) / item_price) * 100
            
            # Check if investment has doubled (is "free")
            is_free = current_value >= (item_price * 2)
            
            # Calculate historical growth rate for this period
            actual_years = (hist.index[-1] - hist.index[0]).days / 365.25
            growth_rate = ((current_price / historical_price) ** (1 / actual_years)) - 1
            
            # Validate growth rate
            if growth_rate <= -0.5 or growth_rate > 1.0:
                print(f"[GIRL MATH] Calculated growth rate {growth_rate*100:.2f}% seems unrealistic, using default")
                growth_rate = 0.08
            
            # Calculate years until free (if not free yet)
            years_until_free = None
            if not is_free and growth_rate > 0:
                # How much more does it need to grow? Need to reach 2x original investment
                remaining_multiple = (item_price * 2) / current_value
                years_until_free = math.log(remaining_multiple) / math.log(1 + growth_rate)
                years_until_free = round(years_until_free, 1)
            
            print(f"[GIRL MATH] Result: ${historical_price:.2f} → ${current_price:.2f} | "
                  f"Value: ${current_value:.2f} | Gain: {percent_gain:.1f}% | "
                  f"Free: {is_free}")
            
            return GirlMathResponse(
                ticker=quote.ticker,
                item_price=item_price,
                years_ago=years_ago,
                historical_stock_price=round(historical_price, 2),
                current_stock_price=round(current_price, 2),
                shares_bought=round(shares_bought, 4),
                current_value=round(current_value, 2),
                profit_loss=round(profit_loss, 2),
                percent_gain=round(percent_gain, 2),
                is_free=is_free,
                years_until_free=years_until_free,
                growth_rate_percentage=round(growth_rate * 100, 2),
                timestamp=datetime.utcnow()
            )
            
        except KeyError as ke:
            print(f"[GIRL MATH] Missing data field for {ticker}: {ke}")
            return None
        except ValueError as ve:
            print(f"[GIRL MATH] Value error for {ticker}: {ve}")
            return None
        except Exception as e:
            print(f"[GIRL MATH] Error calculating for {ticker}: {type(e).__name__} - {e}")
            return None
    
    def calculate_girl_math_with_recommendation(
        self,
        item_price: float,
        years_ago: int,
        approach: str,
        goal: str,
        horizon: str,
        shopping_site: str,
        cart_total: float
    ) -> Optional[GirlMathRecommendationResponse]:
        """
        Calculates girl math with a randomly selected stock from the approach category
        and generates a personalized blurb based on approach and goal.
        
        Args:
            item_price: Cost of the item
            years_ago: How many years ago you would have invested
            approach: Investment approach (conservative, balanced, aggressive)
            goal: Financial goal
            horizon: Time horizon
            shopping_site: Shopping website name
            cart_total: Cart total amount
            
        Returns:
            GirlMathRecommendationResponse with personalized message, or None if calculation fails
        """
        print(f"[RECOMMENDATION] Approach: {approach}, Goal: {goal}, Amount: ${item_price}")
        
        # Get the stock list for this approach
        stock_list = APPROACH_STOCKS.get(approach.lower())
        if not stock_list:
            print(f"[RECOMMENDATION] Invalid approach: {approach}")
            return None
        
        # Randomly select a stock from the list
        selected_ticker = random.choice(stock_list)
        print(f"[RECOMMENDATION] Randomly selected {selected_ticker} from {approach} list: {stock_list}")
        
        # Calculate the girl math for this stock
        result = self.calculate_girl_math(
            ticker=selected_ticker,
            item_price=item_price,
            years_ago=years_ago
        )
        
        if result is None:
            print(f"[RECOMMENDATION] Failed to calculate for {selected_ticker}, trying another...")
            # Try another random pick if the first one fails
            remaining_stocks = [s for s in stock_list if s != selected_ticker]
            if remaining_stocks:
                selected_ticker = random.choice(remaining_stocks)
                print(f"[RECOMMENDATION] Retry with {selected_ticker}")
                result = self.calculate_girl_math(
                    ticker=selected_ticker,
                    item_price=item_price,
                    years_ago=years_ago
                )
            
            if result is None:
                print(f"[RECOMMENDATION] All stocks failed for {approach} approach")
                return None
        
        # Generate the personalized blurb
        blurb = self._generate_blurb(
            approach=approach,
            goal=goal,
            horizon=horizon,
            shopping_site=shopping_site,
            cart_total=cart_total,
            ticker=result.ticker,
            past_value=result.historical_stock_price,
            today_value=result.current_stock_price,
            percent_gain=result.percent_gain,
            period_years=result.years_ago
        )
        
        print(f"[RECOMMENDATION] Generated blurb for {approach}/{goal}: {blurb[:100]}...")
        
        # Build the recommendation response
        return GirlMathRecommendationResponse(
            main_blurb=blurb,
            ticker=result.ticker,
            item_price=result.item_price,
            years_ago=result.years_ago,
            historical_stock_price=result.historical_stock_price,
            current_stock_price=result.current_stock_price,
            shares_bought=result.shares_bought,
            current_value=result.current_value,
            profit_loss=result.profit_loss,
            percent_gain=result.percent_gain,
            is_free=result.is_free,
            years_until_free=result.years_until_free,
            growth_rate_percentage=result.growth_rate_percentage,
            approach=approach,
            goal=goal,
            horizon=horizon,
            shopping_site=shopping_site,
            timestamp=result.timestamp
        )
    
    def get_esg_stocks(self) -> List[StockQuote]:
        """
        Fetches data for list of ESG-friendlt tickers and returns
        only high sustainability score opportunities
        """
        
        # list of tickers
        esg_tickers = ["MSFT", "NVDA", "ADBE", "TSLA", "V"]

        #min acceptable sustainability score - 60 is high
        min_esg_score = 60
        esg_list: List[StockQuote] = []

        #fetch data for each ticker
        for ticker in esg_tickers:
           
            quote = self.get_real_time_price(ticker)
        
            #check if sustainability score meets the min threshold
            if quote:
    
                # get score as string
                score_str = quote.sustainability_score
                
                # 2. string to float, handling "N/A" 
                try:
                    current_score = float(score_str)
                except (ValueError, TypeError):
                    current_score = 0.0 # Treat as 0
                
                # 3. compare float score to the integer min
                if current_score >= min_esg_score:
                    esg_list.append(quote)
        
        # sort the list by highest sustainability score
        esg_list.sort(key=lambda x: float(x.sustainability_score), reverse=True)

        return esg_list
    
# Create a instance for the router to use
stock_service = StockService()



