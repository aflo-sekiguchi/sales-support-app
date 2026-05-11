# backend/app/config.py

# 本番・開発環境ごとに切り替えやすいように変数化
CORS_ORIGINS = [
    "http://localhost:5173",  # Viteの開発サーバー
    "http://127.0.0.1:5173",
]
