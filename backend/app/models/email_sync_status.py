from sqlalchemy import Column, Integer, DateTime
from app.database import Base
from datetime import datetime, timezone

class EmailSyncStatus(Base):
    __tablename__ = "email_sync_status"
    id = Column(Integer, primary_key=True, index=True)
    last_updated_at = Column(
      DateTime(timezone=True),
      default=lambda: datetime.now(timezone.utc),
      nullable=False,
    )
    added = Column(Integer, nullable=True)
    deleted = Column(Integer, nullable=True)
    remaining = Column(Integer, nullable=True)
