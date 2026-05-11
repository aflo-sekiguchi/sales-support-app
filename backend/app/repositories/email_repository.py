from sqlalchemy.orm import Session
from ..models.email import Email

def get_all_emails(db: Session):
    return db.query(Email).order_by(Email.received_at.desc()).all()
