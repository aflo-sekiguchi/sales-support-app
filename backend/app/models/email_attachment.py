from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class EmailAttachment(Base):
    __tablename__ = "email_attachments"
    id = Column(Integer, primary_key=True, index=True)
    email_id = Column(
        Integer, ForeignKey("emails.id", ondelete="CASCADE"), nullable=False, index=True
    )

    file_name = Column(String(500), nullable=False)
    file_path = Column(String(1000), nullable=False)
    mime_type = Column(String(255), nullable=False)
    size = Column(Integer, nullable=False)  # byte

    # Email との逆参照
    email = relationship("Email", back_populates="attachments")
