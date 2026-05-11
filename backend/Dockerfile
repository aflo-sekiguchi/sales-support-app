# backend/Dockerfile
FROM python:3.11-slim

# 基本ツール
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 作業ディレクトリ
WORKDIR /app

# OSパッケージ（ビルドに必要なもの）
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Poetry を使う場合はここで入れることも可能（今回は requirements.txt を利用）
# コピーして依存インストール
COPY ./backend/requirements.txt /app/requirements.txt
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r /app/requirements.txt

# アプリケーションコードをコピー（開発時はボリュームで上書き）
COPY ./backend /app

# 環境変数（デフォルトの待ち受けポート）
ENV PORT=8000

# 開発時のCMD: uvicorn（hot reload はローカルマウント + uvicorn --reload を利用）
# 本番では gunicorn + uvicorn workers を検討
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# 本番追加
# CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "app.main:app", "--workers", "4", "--bind", "0.0.0.0:8000"]
