from fastapi import APIRouter, Depends, status
from typing import List, Dict
from pydantic import BaseModel

from src.models import User
from src.security import get_current_user

router = APIRouter(prefix="/api/pricing", tags=["Pricing"])

class PriceOption(BaseModel):
    platform: str
    price: float
    condition: str  # "New" | "Used" | "Digital"
    delivery: str
    isBestValue: bool
    affiliateUrl: str

MOCK_PRICES: Dict[str, List[Dict]] = {
    "Atomic Habits": [
        {"platform": "Amazon", "price": 11.99, "condition": "New", "delivery": "Free Prime shipping", "isBestValue": False, "affiliateUrl": "https://amazon.com/dp/0735211299"},
        {"platform": "Barnes & Noble", "price": 14.39, "condition": "New", "delivery": "Ships in 2-3 days", "isBestValue": False, "affiliateUrl": "https://barnesandnoble.com/w/atomic-habits"},
        {"platform": "Bookshop.org", "price": 24.84, "condition": "New", "delivery": "Supports local bookstores", "isBestValue": False, "affiliateUrl": "https://bookshop.org/books/atomic-habits"},
        {"platform": "ThriftBooks", "price": 8.49, "condition": "Used", "delivery": "Ships in 5 days", "isBestValue": True, "affiliateUrl": "https://thriftbooks.com/w/atomic-habits"},
        {"platform": "Google Play Books", "price": 12.99, "condition": "Digital", "delivery": "Instant Access", "isBestValue": False, "affiliateUrl": "https://play.google.com/store/books"}
    ],
    "Project Hail Mary": [
        {"platform": "Amazon", "price": 13.59, "condition": "New", "delivery": "Free Prime shipping", "isBestValue": True, "affiliateUrl": "https://amazon.com/dp/0593135202"},
        {"platform": "Barnes & Noble", "price": 16.99, "condition": "New", "delivery": "Ships in 1-2 days", "isBestValue": False, "affiliateUrl": "https://barnesandnoble.com"},
        {"platform": "ThriftBooks", "price": 14.20, "condition": "Used", "delivery": "Ships in 3-5 days", "isBestValue": False, "affiliateUrl": "https://thriftbooks.com"}
    ],
    "Sapiens: A Brief History of Humankind": [
        {"platform": "Amazon", "price": 14.99, "condition": "New", "delivery": "Free shipping", "isBestValue": False, "affiliateUrl": "https://amazon.com"},
        {"platform": "ThriftBooks", "price": 7.99, "condition": "Used", "delivery": "Ships in 5 days", "isBestValue": True, "affiliateUrl": "https://thriftbooks.com"}
    ],
    "Deep Work": [
        {"platform": "Amazon", "price": 14.29, "condition": "New", "delivery": "Free Prime shipping", "isBestValue": False, "affiliateUrl": "https://amazon.com"},
        {"platform": "AbeBooks", "price": 6.50, "condition": "Used", "delivery": "Ships in 7 days", "isBestValue": True, "affiliateUrl": "https://abebooks.com"}
    ],
    "Dune": [
        {"platform": "Amazon", "price": 9.99, "condition": "New", "delivery": "Free Prime shipping", "isBestValue": True, "affiliateUrl": "https://amazon.com"},
        {"platform": "Barnes & Noble", "price": 10.99, "condition": "New", "delivery": "Ships in 2 days", "isBestValue": False, "affiliateUrl": "https://barnesandnoble.com"}
    ],
    "Thinking, Fast and Slow": [
        {"platform": "Amazon", "price": 12.80, "condition": "New", "delivery": "Free shipping", "isBestValue": False, "affiliateUrl": "https://amazon.com"},
        {"platform": "ThriftBooks", "price": 6.20, "condition": "Used", "delivery": "Ships in 4 days", "isBestValue": True, "affiliateUrl": "https://thriftbooks.com"}
    ]
}

@router.get("/{book_title}", response_model=List[PriceOption], status_code=status.HTTP_200_OK)
async def get_prices(
    book_title: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get price comparisons across multiple platforms for a book.
    """
    # Check if we have exact or partial match
    matched_key = None
    for key in MOCK_PRICES.keys():
        if book_title.lower() in key.lower() or key.lower() in book_title.lower():
            matched_key = key
            break
            
    if matched_key:
        return MOCK_PRICES[matched_key]
        
    # Generate dynamic mock prices if not found
    title_hash = sum(ord(c) for c in book_title)
    base_price = 10.0 + (title_hash % 15)
    
    return [
        PriceOption(
            platform="Amazon",
            price=round(base_price * 0.95, 2),
            condition="New",
            delivery="Free Prime shipping",
            isBestValue=False,
            affiliateUrl=f"https://amazon.com/s?k={book_title.replace(' ', '+')}"
        ),
        PriceOption(
            platform="ThriftBooks",
            price=round(base_price * 0.65, 2),
            condition="Used",
            delivery="Ships in 5 days",
            isBestValue=True,
            affiliateUrl="https://thriftbooks.com"
        ),
        PriceOption(
            platform="Google Play Books",
            price=round(base_price * 0.85, 2),
            condition="Digital",
            delivery="Instant Access",
            isBestValue=False,
            affiliateUrl="https://play.google.com"
        )
    ]
