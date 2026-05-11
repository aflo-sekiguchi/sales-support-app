from celery import Celery
from celery.schedules import crontab
from datetime import timedelta
import os

# 環境変数からRedis URLやBroker URLを取得する場合も多い
broker_url = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/1")
backend_url = os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/2")

celery_app = Celery(
    "worker",
    broker=broker_url,
    backend=backend_url,
    include=["app.tasks"]  # タスクを定義するモジュール
)

# タスクスケジュール
celery_app.conf.beat_schedule = {
    "sync-emails-scheduling": {
        "task": "sync_emails",
        "schedule": crontab(
            minute="*/5",      # 5分ごと
            hour="9-22",       # 9時～22時
            day_of_week="1-5"  # 月曜～金曜
        ),
        # "schedule": timedelta(seconds=5),  # 秒単位で指定
        "args": (),
    }
}

# 任意で設定
celery_app.conf.update(
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    timezone='Asia/Tokyo',
    enable_utc=False,
)
