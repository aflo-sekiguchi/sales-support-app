from pydantic import BaseModel

class UserRegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    confirm_password: str

class UserLoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class MeResponse(BaseModel):
    name: str
    email: str
