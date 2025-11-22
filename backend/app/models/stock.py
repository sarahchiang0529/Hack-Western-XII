"""
Stock & Girl Math Models
"""
from typing import Optional
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
    years_ago: int = Field(default=2, ge=1, le=10, description="How many years ago you would have bought instead of purchasing the item (1-10)")

class GirlMathResponse(BaseModel):
    """The final data model showing what your investment would be worth if you had invested X years ago"""
    ticker: str
    item_price: float
    years_ago: int = Field(..., description="Years ago the hypothetical investment was made")
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
                "years_ago": 2,
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

""" we can do the list models and whatnot later as feel fit """