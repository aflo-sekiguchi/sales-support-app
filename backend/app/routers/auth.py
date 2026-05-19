from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models import User
from ..schemas.auth import UserRegisterRequest, UserLoginRequest, TokenResponse, MeResponse

from ..database import get_db
from ..services.auth_service import (
    register_user,
    login_user,
    get_me,
    get_current_user,
)

router = APIRouter()

@router.post("/register")
def register(
    user: UserRegisterRequest,
    db: Session = Depends(get_db)
):
    return register_user(user, db)


@router.post("/login", response_model=TokenResponse)
def login(
    user: UserLoginRequest,
    db: Session = Depends(get_db)
):
    return login_user(user, db)

@router.get("/me", response_model=MeResponse)
def me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_me(current_user, db)