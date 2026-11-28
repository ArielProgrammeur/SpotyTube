from typing import Literal

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    project_name: str = "SpotyTube API"
    api_v1_prefix: str = "/api/v1"

    database_url: str = "sqlite:///./spotytube.db"

    debug: bool = True

    # Authentication configuration
    secret_key: SecretStr
    jwt_algorithm: Literal["HS256"] = "HS256"

    access_token_expire_minutes: int = 10
    refresh_token_expire_days: int = 30

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


# pydantic charge les parametres depuis le fichier .env.
# pylance ne detecte pas cette injection automatiquement.
settings = Settings()  # pyright: ignore[reportCallIssue]
