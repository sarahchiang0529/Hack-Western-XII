"""
Stock Service - External Data & Logic
This will handle communication with Yahoo Finance and 'Girl Math' Calculations.
"""
from typing import Dict, List, Optional
from datetime import datetime
import uuid
import math
import yfinance as yf

from app.models.stock import GirlMathResponse, StockQuote


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
    
    def get_real_time_price(self, ticker: str) -> Optional[StockQuote]:
        """
        Fetches live data from yfinance
        Returns none if the ticker is invalid
        """
        ticker = ticker.upper()

        # check cache first
        cached = self._get_from_cache(ticker)
        if cached:
            print(f"Using cached data for {ticker}")
            return cached
        # fetch frm yfinance
        try:
            stock = yf.Ticker(ticker)
            # 'history is more reliable and fast than .info for price
            hist = stock.history(period="1d")

            if hist.empty:
                return None
            
            current_price = hist['Close'].iloc[-1]

            # fetch metadata...could be empty so using .get
            info = stock.info

            quote = StockQuote(
                ticker=ticker,
                price=current_price,
                company_name=info.get('shortName', ticker),
                sector=info.get('sector', 'Unknown'),
                sustainability_score=str(info.get('esgScores', {}).get('totalEsg', 'N/A'))
            )

            # save to cache
            self._cache[ticker] = {
                "data": quote,
                "timestamp": datetime.utcnow()
            }

            return quote
        
        except Exception as e:
            print(f"Error fetching data for {ticker}: {e}")
            return None
        
    def calculate_girl_math(self, ticker: str, item_price: float) -> Optional[GirlMathResponse]:
        """
        Calculates when the purchase will be free 
        Logic: Time to double investment based on 8% annual growth - we can change with actual growth rates later
        """
        quote = self.get_real_time_price(ticker)

        if not quote:
            return None
        
        # if i ivest $150 (item_price) when does it become $300?
        #Formula: t = ln(2) / ln(1 + r)
        growth_rate = 0.08  # CHANGE !!!!!
        years_to_double = math.log(2) / math.log(1 + growth_rate)

        shares_needed = item_price / quote.price

        return GirlMathResponse(
            ticker=quote.ticker,
            item_price=item_price,
            current_stock_price=round(quote.price, 2),
            shares_to_buy=round(shares_needed, 4),
            years_until_free=round(years_to_double, 1),
            timestamp=datetime.utcnow()
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



