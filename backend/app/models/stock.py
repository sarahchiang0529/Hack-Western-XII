"""
Stock & Girl Math Models
"""
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

""" Model for Stock Data """

"""
class StockQuote(BaseModel):
    "Data model for the raw date fetch from yfinance "
    ticker: str = Field(..., min_length=1, max_length=100, description="The stock ticker symbol")
    price: float = Field(..., ge=0, description="Current market price per share")
    company_name: str = Field(..., min_length=1, max_length=100, description="The name of the company")
    sector: str = Field("Unknown", description="The industry sector of the company")
    sustainability_score: Optional[str] = Field("N/A", description="Total ESG score")
"""

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

class GirlMathResponse(BaseModel):
    """the final data model for the API response after calculation """
    ticker: str
    item_price: float
    current_stock_price: float
    shares_to_buy: float = Field(..., description="The fraction of a share purchased with the item price")
    years_until_free: float = Field(..., description="The calculated years for the investment to double")
    growth_assumption_percentage: float = Field(default=8.0, description="The annual growth rate assumed for the calculation")
    timestamp: datetime

    class Config:
        json_schema_extra = {
            "example": {
                "ticker": "DECK",
                "item_price": 150.00,
                "current_stock_price": 900.00,
                "shares_to_buy": 0.1667,
                "years_until_free": 9.0,
                "growth_assumption_percentage": 8.0,
                "timestamp": "2025-11-22T17:55:00"
            }
        }

""" we can do the list models and whatnot later as feel fit """