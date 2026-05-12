from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Enum,
    JSON,
    Float,
)
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime, timezone
import enum

# 種別フラグ用のEnum
class EmailCategory(str, enum.Enum):
    job = "job"  # 求人
    engineer = "engineer"  # エンジニア紹介
    unknown = "unknown"  # 未分類

class Email(Base):
    __tablename__ = "emails"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    uid = Column(String(255), unique=True, index=True, nullable=False)  # IMAPのUID
    from_address = Column(String(255), nullable=False)
    subject = Column(String(500), nullable=True)
    received_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    body = Column(Text, nullable=True)  # ← 本文を保存するカラムを追加
    category = Column(
        Enum(EmailCategory), default=EmailCategory.unknown, nullable=False
    )
    skills = Column(JSON, nullable=True)
    price_min = Column(Integer, nullable=True)
    price_max = Column(Integer, nullable=True)
    ai_confidence = Column(Float, nullable=True)  # AIの分類の信頼度（例: 0.92）
    # 添付ファイルとのリレーション
    attachments = relationship(
        "EmailAttachment", back_populates="email", cascade="all, delete-orphan"
    )
