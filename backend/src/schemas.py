from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
import uuid

class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    start: datetime = Field(..., alias="start_time")
    end: Optional[datetime] = Field(None, alias="end_time")
    all_day: bool = False
    color: str = "#3b82f6"

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: uuid.UUID

    model_config = {"from_attributes": True}