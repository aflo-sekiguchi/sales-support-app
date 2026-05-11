from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Enum,
    JSON,
    Float,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from app.database import Base
import enum
from datetime import datetime, timezone
import pytz

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)


jst = pytz.timezone("Asia/Tokyo")


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


class EmailAttachment(Base):
    __tablename__ = "email_attachments"
    id = Column(Integer, primary_key=True, index=True)
    email_id = Column(
        Integer, ForeignKey("emails.id", ondelete="CASCADE"), nullable=False
    )

    file_name = Column(String(500), nullable=False)
    file_path = Column(String(1000), nullable=False)
    mime_type = Column(String(255), nullable=False)
    size = Column(Integer, nullable=False)  # byte

    # Email との逆参照
    email = relationship("Email", back_populates="attachments")


class EmailSyncStatus(Base):
    __tablename__ = "email_sync_status"
    id = Column(Integer, primary_key=True, index=True)
    last_updated_at = Column(DateTime, default=datetime.now(timezone.utc))
    added = Column(Integer, nullable=True)
    deleted = Column(Integer, nullable=True)
    remaining = Column(Integer, nullable=True)
