import os
from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List

from ..database import get_db
from ..schemas.email import (
    EmailResponse,
    SearchRequest,
    MatchRequest,
    EmailSyncStatusResponse,
    DownloadFileRequest,
)
from ..services.email_search_service import search_emails_service
from ..services.match_service import match_emails_service
from ..models.email import Email, EmailSyncStatus
from ..celery_app import celery_app
from celery.result import AsyncResult  # ← これを追加


router = APIRouter(prefix="/emails", tags=["Emails"])


@router.get("/all", response_model=List[EmailResponse])
def get_all_emails(db: Session = Depends(get_db)):
    return db.query(Email).order_by(Email.received_at.desc()).all()


@router.post("/search", response_model=List[EmailResponse])
def search_emails(req: SearchRequest, db: Session = Depends(get_db)):
    return search_emails_service(req, db)


@router.post("/match", response_model=List[EmailResponse])
def match_emails(req: MatchRequest, db: Session = Depends(get_db)):
    return match_emails_service(req, db)


@router.post("/sync-emails")
async def trigger_sync_emails():
    task = celery_app.send_task("sync_emails")
    return {"task_id": task.id}


@router.post("/task-result/{task_id}")
def get_result(task_id: str):
    result = AsyncResult(task_id, app=celery_app)
    return {"state": result.state, "result": result.result}


@router.post("/email-sync-status", response_model=EmailSyncStatusResponse)
def get_status(db: Session = Depends(get_db)):
    last_updated_at = db.scalar(select(EmailSyncStatus.last_updated_at))
    return {"last_updated_at": last_updated_at}


@router.get("/test")
def get_test(db: Session = Depends(get_db)):
    test = db.query(Email).get(27344)
    return test.attachments


@router.post("/files")
def download_file(req: DownloadFileRequest):
    file_path = os.path.join("/app/uploads", req.uid, req.file_name)
    return FileResponse(
        path=file_path, filename=req.file_name, media_type=req.mime_type
    )


# @router.post("/ping-redis")
# def ping_redis_api():
#     task = ping_redis.delay()
#     return {"task_id": task.id}
