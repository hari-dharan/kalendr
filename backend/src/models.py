from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Text, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
import uuid
from src.database import Base

class Event(Base):
    __tablename__ = "events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    start_time: Mapped[str] = mapped_column(TIMESTAMP(timezone=False), nullable=False)
    end_time: Mapped[str] = mapped_column(TIMESTAMP(timezone=False), nullable=True)
    color: Mapped[str] = mapped_column(String(20), default="#3b82f6")