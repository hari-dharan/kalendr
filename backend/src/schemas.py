from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class EventBase(BaseModel):
    title: str
    start: datetime
    end: Optional[datetime] = None
    color: Optional[str] = "#3b82f6"

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: UUID

    class Config:
        from_attributes = True