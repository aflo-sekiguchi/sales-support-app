from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func

from ..models.email import Email
from ..schemas.email import SearchRequest


def split_query(raw: str):
    return raw.replace("　", " ").split()


def build_search_filters(words):
    return [
        or_(
            func.lower(Email.from_address).like(f"%{w.lower()}%"),
            func.lower(Email.subject).like(f"%{w.lower()}%"),
            func.lower(Email.body).like(f"%{w.lower()}%"),
        )
        for w in words
    ]


def search_emails_service(req: SearchRequest, db: Session):
    raw_query = req.query.strip()
    if not raw_query:
        return []

    words = split_query(raw_query)
    filters = build_search_filters(words)

    return (
        db.query(Email)
        .filter(Email.category == req.category, and_(*filters))
        .order_by(Email.received_at.desc())
        .all()
    )
