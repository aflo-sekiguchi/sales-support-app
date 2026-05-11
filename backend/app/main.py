from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# config.py から CORS 設定を読み込み
from app.config import CORS_ORIGINS

# ルーター読み込み（例：routers ディレクトリ）
from app.routers import (
  emails,
  # 他に存在する router があればここに追加
)

app = FastAPI()

# ===========================
# CORS 設定
# ===========================
app.add_middleware(
  CORSMiddleware,
  allow_origins=CORS_ORIGINS,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# ===========================
# ルーター登録
# ===========================
app.include_router(emails.router)