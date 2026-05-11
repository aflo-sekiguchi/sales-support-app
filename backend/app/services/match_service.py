from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import List

from ..models.email import Email
from ..schemas.email import MatchRequest


CATEGORY_MAP = {
    "engineer": "job",
    "job": "engineer",
}


def calculate_match_score(email: Email, skills: List[str]) -> int:
    return len(set(email.skills or []) & set(skills))


def match_emails_service(req: MatchRequest, db: Session):
    target_category = CATEGORY_MAP.get(req.category)
    if not target_category:
        raise HTTPException(400, f"Unsupported category: {req.category}")

    emails = db.query(Email).filter(Email.category == target_category).all()

    matched = []
    for email in emails:
        score = calculate_match_score(email, req.skills)
        if score > 0:
            email.match_score = score
            matched.append(email)

    matched.sort(key=lambda x: (x.match_score, x.received_at), reverse=True)

    for email in matched:
        delattr(email, "match_score")

    return matched
