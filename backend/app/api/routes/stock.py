"""
Stock API Routes
"""
from fastapi import APIRouter, HTTPException, Depends, Path, Query
from typing import List, Annotated
from app.services.stock_service import stock_service, StockService, StockQuote
from app.models.stock import GirlMathRequest, GirlMathResponse, GirlMathRecommendationRequest, GirlMathRecommendationResponse

# Create router
router = APIRouter(
    prefix="/stock",
    tags=["Stock Data & Girl Math"]
)

# Dependency injection for service
def get_stock_service() -> StockService:
    """Returns the stock service instance"""
    return stock_service


@router.get(
    "/price/{ticker}",
    response_model=StockQuote,
    summary="Get real-time stock price",
    description="Fetches the current stock price and company information for a given ticker symbol."
)
async def get_stock_price(
    ticker: str = Path(..., description="Stock ticker symbol (e.g., AAPL, MSFT)", min_length=1, max_length=10),
    service: Annotated[StockService, Depends(get_stock_service)] = None
):
    """
    Get real-time stock price and metadata for a ticker.
    
    Example: GET /api/stock/price/AAPL
    """
    result = service.get_real_time_price(ticker)
    
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Could not fetch data for ticker '{ticker}'. Please verify the ticker symbol is valid."
        )
    
    return result


@router.post(
    "/calculate", 
    response_model=GirlMathResponse,
    summary="Calculate 'What If I Invested Instead' - Historical Analysis",
    description="Shows what your investment would be worth TODAY if you had invested in a stock X years ago instead of buying an item. Returns current value, profit/loss, whether it's 'free' (doubled), and if not, how many years until it doubles from now."
)
async def calculate_girl_math(
    request: GirlMathRequest,
    service: Annotated[StockService, Depends(get_stock_service)] = None
):
    """
    Run the Girl Math calculation: What if I invested instead of buying?
    
    Example request body:
    {
        "ticker": "AAPL",
        "item_price": 150.00,
        "years_ago": 2
    }
    
    Response shows:
    - Historical stock price from X years ago
    - Current stock price and value
    - Shares you would have bought
    - Current value of investment
    - Profit/loss and percentage gain
    - Whether the item is "free" (investment doubled)
    - If not free yet, years until it doubles from now
    - Historical growth rate used for projections
    
    The years_ago parameter (optional, default: 2) lets you see what would have
    happened if you invested 1-30 years ago instead of making the purchase.
    """
    # Call the service method with years_ago parameter
    result = service.calculate_girl_math(
        ticker=request.ticker,
        item_price=request.item_price,
        years_ago=request.years_ago
    )    
    
    # Handle failure - invalid ticker or API error
    if result is None:
        raise HTTPException(
            status_code=400,
            detail=f"Could not fetch data for ticker '{request.ticker}'. Please check the ticker symbol and try again or ensure there is sufficient historical data."
        )
    
    return result


@router.post(
    "/calculate-with-recommendations",
    response_model=GirlMathRecommendationResponse,
    summary="Calculate 'What If I Invested Instead' with Personalized Recommendations",
    description="Shows what your investment would be worth TODAY if you had invested in a randomly selected stock from your chosen approach (conservative/balanced/aggressive) X years ago. Returns a personalized message based on your financial goals and risk tolerance."
)
async def calculate_girl_math_with_recommendations(
    request: GirlMathRecommendationRequest,
    service: Annotated[StockService, Depends(get_stock_service)] = None
):
    """
    Run the Girl Math calculation with personalized stock recommendations.
    
    Example request body:
    {
        "item_price": 150.00,
        "years_ago": 2,
        "approach": "balanced",
        "goal": "travel",
        "horizon": "medium",
        "shopping_site": "Amazon",
        "cart_total": 150.00
    }
    
    The endpoint will:
    - Randomly select a stock from the approach category
      * Conservative: VTI, VOO, BND (index funds, bonds)
      * Balanced: VT, XEQT, AAPL (diversified)
      * Aggressive: QQQ, NVDA, TSLA (high growth)
    - Calculate historical performance
    - Generate a personalized message based on approach + goal
    
    Response includes all calculation details plus a custom "girl math" blurb
    tailored to your investment style and financial goals.
    """
    # Call the service method
    result = service.calculate_girl_math_with_recommendation(
        item_price=request.item_price,
        years_ago=request.years_ago,
        approach=request.approach,
        goal=request.goal,
        horizon=request.horizon,
        shopping_site=request.shopping_site,
        cart_total=request.cart_total
    )
    
    # Handle failure - invalid approach or API error
    if result is None:
        raise HTTPException(
            status_code=400,
            detail=f"Could not calculate recommendation for approach '{request.approach}'. Please check your inputs and try again."
        )
    
    return result


@router.get(
    "/esg",
    response_model=List[StockQuote],
    summary="Get high ESG-rated stocks",
    description="Returns a list of stocks that meet high sustainability/ESG rating criteria."
)
async def get_esg_stocks(
    service: Annotated[StockService, Depends(get_stock_service)] = None
):
    """
    Gets a list of stocks that meet high ESG rating thresholds.
    
    Returns stocks sorted by sustainability score (highest first).
    """
    results = service.get_esg_stocks()
    
    if not results:
        raise HTTPException(
            status_code=503,
            detail="Unable to fetch ESG stock data at this time. Please try again later."
        )
    
    return results
