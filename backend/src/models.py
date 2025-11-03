from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Text, TIMESTAMP, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from src.database import Base

class Event(Base):
    __tablename__ = "events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    location: Mapped[str] = mapped_column(Text, nullable=True)
    
    # Time fields - handle both timed and all-day events
    start_time: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=False), nullable=False)
    end_time: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=False), nullable=True)
    all_day: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Visual customization
    color: Mapped[str] = mapped_column(String(20), default="#3b82f6")