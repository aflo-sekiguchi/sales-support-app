from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_HOST: str
    REDIS_PORT: str
    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    ALGORITHM: str
    IMAP_HOST: str
    IMAP_PORT: str
    IMAP_USER: str
    IMAP_PASSWORD: str
    GEMINI_API_KEY: str
    CORS_ORIGINS: list[str]

    class Config:
        env_file = ".env"


settings = Settings()