from pydantic_settings import BaseSettings




class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://sarangsho:5423687@localhost:5432/bookreview"
    SECRET_KEY: str = "ac94a3dec4a97c216597a8eed7e32b4aaf209fd15c9ddb00189765dab6fb3112"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

settings = Settings()
