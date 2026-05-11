from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List
from enum import Enum


# --- SQLAlchemy側のEnumと一致するEnumを定義 ---
class EmailCategory(str, Enum):
    unknown = "unknown"
    job = "job"
    engineer = "engineer"


# --- GeminiのAPIのレスポンス型 ---
class EmailResponseGemini(BaseModel):
    category: EmailCategory
    skills: List[str]
    price_min: int
    price_max: int


# --- APIレスポンスモデル 添付ファイル ---
class EmailAttachmentsResponse(BaseModel):
    id: int
    email_id: int
    file_name: str
    file_path: str
    mime_type: str
    size: int
    model_config = ConfigDict(from_attributes=True)


# --- APIレスポンスモデル Eメール ---
class EmailResponse(BaseModel):
    id: int
    uid: str
    from_address: str
    subject: Optional[str]
    received_at: datetime
    body: Optional[str]
    category: EmailCategory
    skills: Optional[List[str]] = None  # JSON型はDictで表現
    price_min: Optional[int]
    price_max: Optional[int]
    ai_confidence: Optional[float]
    attachments: List[EmailAttachmentsResponse] = []
    model_config = ConfigDict(from_attributes=True)


# --- router関数の引数型 ---
class SearchRequest(BaseModel):
    query: str
    category: str


class MatchRequest(BaseModel):
    category: str
    skills: List[str]


class EmailSyncStatusResponse(BaseModel):
    last_updated_at: datetime


class DownloadFileRequest(BaseModel):
    uid: str
    file_name: str
    mime_type: str
