from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt
from jose.exceptions import ExpiredSignatureError
from app.core.config import settings
from app.models import User
from ..database import get_db
from ..schemas.auth import UserRegisterRequest, UserLoginRequest
from ..core.security import (
    hash_password,
    verify_password,
    create_access_token,
    oauth2_scheme
)

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM

# ユーザ登録
def register_user(
    user: UserRegisterRequest,
    db: Session
):

    hashed_password = hash_password(user.password)

    db_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
    )

    db.add(db_user)
    db.commit()

    return {
        "message": "created"
    }

def search_user(
    email: str,
    db: Session
):
    db_user = db.query(User).filter(
        User.email == email
    ).first()

    return db_user

# ユーザログイン
def login_user(
    user: UserLoginRequest,
    db: Session
):

    db_user = search_user(user.email, db)

    if not db_user:
        raise HTTPException(status_code=401)

    if not verify_password(
        user.password,
        db_user.hashed_password
    ):
        raise HTTPException(status_code=401)

    token = create_access_token({
        "sub": db_user.email
    })

    return {
        "access_token": token,
        "token_type": "bearer",
    }

# ユーザ認証
def get_current_user(
    db: Session = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
):
    try:
        payload = decode_token(token)

        email = payload.get("sub")

        if email is None:
            raise HTTPException(status_code=401)

        user = search_user(email, db)
        return user

    except:
        raise HTTPException(status_code=401)

# ユーザ名取得
def get_me(
    current_user: User,
    db: Session
):
    return {
        "name": current_user.name,
        "email": current_user.email,
    }

# トークン解析
def decode_token(token: str):

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired"
        )

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    return payload

