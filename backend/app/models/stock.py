"""
Stock & Girl Math Models
"""
from typing import Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime

""" Model for Stock Data """

class StockQuote(BaseModel):
    """Data model for the raw date fetch from yfinance"""
    ticker: str = Field(..., min_length=1, max_length=100, description="The stock ticker symbol")
    price: float = Field(..., ge=0, description="Current market price per share")
    company_name: str = Field(..., min_length=1, max_length=100, description="The name of the company")
    sector: str = Field("Unknown", description="The industry sector of the company")
    sustainability_score: Optional[str] = Field("N/A", description="Total ESG score")

"""
class StockQuoteCreate(BaseModel):
    ' Model for creating a new stock '
    pass #


class StockQuoteUpdate(BaseModel):
    ' Model for updating an existing stock '
    ticker: str = Field(..., min_length=1, max_length=100, description="The stock ticker symbol")
    price: float = Field(..., ge=0, description="Current market price per share")
    company_name: str = Field(..., min_length=1, max_length=100, description="The name of the company")
    sector: str = Field("Unknown", description="The industry sector of the company")
    sustainability_score: Optional[str] = Field("N/A", description="Total ESG score")
"""

""" Model for the "Girl Math" Calculation Response """
class GirlMathRequest(BaseModel):
    """ Model for the data coming into the API to start the calculation """
    ticker: str = Field(..., description="The stock ticker symbol associated with the item")
    item_price: float = Field(..., ge=0.01, description="The cost of the item")
    years_ago: int = Field(default=2, ge=1, le=30, description="How many years ago you would have bought instead of purchasing the item (1-30)")

class GirlMathResponse(BaseModel):
    """The final data model showing what your investment would be worth if you had invested X years ago"""
    ticker: str
    item_price: float
    years_ago: float = Field(..., description="Years ago the hypothetical investment was made (can be fractional like 0.5 for 6 months)")
    historical_stock_price: float = Field(..., description="Stock price X years ago")
    current_stock_price: float = Field(..., description="Current stock price")
    shares_bought: float = Field(..., description="Number of shares that could have been bought")
    current_value: float = Field(..., description="Current value of the investment")
    profit_loss: float = Field(..., description="Profit or loss amount")
    percent_gain: float = Field(..., description="Percentage gain/loss")
    is_free: bool = Field(..., description="True if investment has doubled (item is 'free')")
    years_until_free: Optional[float] = Field(None, description="Years until investment doubles from now (if not free yet)")
    growth_rate_percentage: float = Field(..., description="Historical annual growth rate used (as percentage)")
    timestamp: datetime

    class Config:
        json_schema_extra = {
            "example": {
                "ticker": "AAPL",
                "item_price": 150.00,
                "years_ago": 6,
                "historical_stock_price": 130.00,
                "current_stock_price": 189.50,
                "shares_bought": 1.1538,
                "current_value": 218.65,
                "profit_loss": 68.65,
                "percent_gain": 45.77,
                "is_free": False,
                "years_until_free": 8.2,
                "growth_rate_percentage": 10.5,
                "timestamp": "2025-11-22T19:00:00"
            }
        }

""" Model for the "Girl Math" Calculation with Recommendations """
class GirlMathRecommendationRequest(BaseModel):
    """Model for the data coming into the API to start the calculation with personalized recommendations"""
    item_price: float = Field(..., ge=0.01, description="The cost of the item")
    approach: Literal["conservative", "balanced", "aggressive"] = Field(..., description="Investment approach/risk tolerance")
    goal: Literal["emergency", "travel", "future_home", "long_term_wealth", "other"] = Field(..., description="Financial goal for the investment")
    horizon: Literal["short", "medium", "long"] = Field(..., description="Investment time horizon")
    shopping_site: str = Field(..., description="Name of the shopping website")
    cart_total: float = Field(..., ge=0.01, description="Total cart value (typically same as item_price)")

class GirlMathRecommendationResponse(BaseModel):
    """The final data model showing personalized investment recommendation with custom messaging"""
    ticker: str = Field(..., description="Stock ticker symbol")
    period_label: str = Field(..., description="Human readable period (e.g., '3 months', '1 year')")
    return_pct: str = Field(..., description="Formatted return percentage (e.g., '+1265.5%')")
    pastValueFormatted: str = Field(..., description="Formatted past investment amount (e.g., '$200')")
    todayValueFormatted: str = Field(..., description="Formatted current value with commas (e.g., '$2,730.99')")
    historical_stock_price: float = Field(..., description="Stock price at the time in the past")
    current_stock_price: float = Field(..., description="Current stock price per share")
    shares_bought: float = Field(..., description="Number of shares that could have been bought")
    main_blurb: str = Field(..., description="Personalized message based on approach and goal")
    return_label: str = Field(default="Return", description="Label for return section")
    return_value: str = Field(..., description="Return percentage value (same as return_pct)")
    growth_label: str = Field(default="Value Today", description="Label for growth section")
    growth_value: str = Field(..., description="Today's value (same as todayValueFormatted)")

    class Config:
        json_schema_extra = {
            "example": {
                "ticker": "NVDA",
                "period_label": "6 months",
                "return_pct": "+25.5%",
                "pastValueFormatted": "$200",
                "todayValueFormatted": "$251.00",
                "historical_stock_price": 100.50,
                "current_stock_price": 125.63,
                "shares_bought": 1.9900,
                "main_blurb": "if your $200 had gone into NVDA 6 months ago, it could be worth around $251.00 today — a serious glow-up moment. Just a cute reminder for your long-term wealth era <3",
                "return_label": "Return",
                "return_value": "+25.5%",
                "growth_label": "Value Today",
                "growth_value": "$251.00"
            }
        }

""" we can do the list models and whatnot later as feel fit """