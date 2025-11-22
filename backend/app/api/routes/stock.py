"""
Stock CRUD Routes
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from typing import Annotated
from app.services.stock_service import stock_service, StockService, StockQuote
from app.models.stock import GirlMathRequest, GirlMathResponse

router = APIRouter(
    prefix="/stock",
    tags=["Stock Data & Female Investor Tools"]
)

# router
router = APIRouter(prefix="/stock", tags=["STock Data & Girl Math"])

# service instance
def get_stock_service() -> StockService:
    return stock_service

# endpoint 
@router.post(
    "/calculate", 
    response_model=GirlMathResponse,
    summary ="Calculate 'Years Until Free' for the purchase item",
    description= "Takes a stock ticker and item proce, fetches real-time stock price, and calculates the investment time in years required to double, therby making the item 'free'."
)
    
async def calculate_girl_math_endpoint(
    request: GirlMathRequest,
    service: Annotated[StockService, Depends(get_stock_service)]
):
    """
    Handles the POST request to run the Girl Math calculation.
    """
    # service logic
    result = service.calculate_girl_math_endpoint(
        ticker=request.ticker,
        item_price=request.item_price
    )    
    
    # failure - invalid ticker or API block
    if result is None:
        raise HTTPException(
            status_code=400,
            detail=f"Could not fetch data for ticker '{request.ticker}'. Please check the ticker symbol and try again."
        )
    
@router.get(
    "/esg",
    response_model=List[StockQuote],
    summary="Get a list of high esg rated stocks"
)
async def get_esg_stocks_list():
    """
    gets a list of stocks that meet a high sg rating
    """
    return stock_service.get_esg_stocks()
    
    # response
    return result
