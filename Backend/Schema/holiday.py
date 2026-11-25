from pydantic import BaseModel
from typing import Optional, Any
from datetime import date


class HolidayCreate(BaseModel):
    name: str
    holiday_date: Any
    type: Optional[str] = "National"
    region: Optional[str] = "All India"
    description: Optional[str] = None


class HolidayUpdate(BaseModel):
    name: Optional[str] = None
    holiday_date: Optional[Any] = None
    type: Optional[str] = None
    region: Optional[str] = None
    description: Optional[str] = None
