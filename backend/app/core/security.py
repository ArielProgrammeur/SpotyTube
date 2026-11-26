import hashlib
from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import (
    InvalidHashError,
    VerificationError,
    VerifyMismatchError,
)
from jwt import InvalidTokenError

from app.core.config import settings

TOKEN_ISSUER = "spotytube-api"

password_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    """Hache un mot de passe avec Argon2id."""

    return password_hasher.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """Vérifie un mot de passe contre son empreinte."""

    try:
        return password_hasher.verify(
            hashed_password,
            plain_password,
        )
    except (
        VerifyMismatchError,
        VerificationError,
        InvalidHashError,
    ):
        return False


def password_needs_rehash(hashed_password: str) -> bool:
    """Vérifie si les paramètres de hachage doivent être actualisés."""

    try:
        return password_hasher.check_needs_rehash(hashed_password)
    except (VerificationError, InvalidHashError):
        return True


def hash_refresh_token(token: str) -> str:
    """Calcule l'empreinte SHA-256 d'un refresh token."""

    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _create_token(
    *,
    user_id: UUID,
    session_id: UUID,
    token_type: str,
    expires_delta: timedelta,
) -> str:
    """Construit et signe un JWT."""

    now = datetime.now(UTC)

    payload = {
        "sub": str(user_id),
        "sid": str(session_id),
        "type": token_type,
        "jti": str(uuid4()),
        "iss": TOKEN_ISSUER,
        "iat": now,
        "exp": now + expires_delta,
    }

    return jwt.encode(
        payload,
        settings.secret_key.get_secret_value(),
        algorithm=settings.jwt_algorithm,
    )


def create_access_token(
    user_id: UUID,
    session_id: UUID,
) -> str:
    return _create_token(
        user_id=user_id,
        session_id=session_id,
        token_type="access",
        expires_delta=timedelta(
            minutes=settings.access_token_expire_minutes,
        ),
    )


def create_refresh_token(
    user_id: UUID,
    session_id: UUID,
) -> str:
    return _create_token(
        user_id=user_id,
        session_id=session_id,
        token_type="refresh",
        expires_delta=timedelta(
            days=settings.refresh_token_expire_days,
        ),
    )


def decode_token(
    token: str,
    expected_type: str,
) -> dict[str, object]:
    """Vérifie la signature et les informations d'un JWT."""

    payload = jwt.decode(
        token,
        settings.secret_key.get_secret_value(),
        algorithms=[settings.jwt_algorithm],
        issuer=TOKEN_ISSUER,
        options={
            "require": [
                "sub",
                "sid",
                "type",
                "jti",
                "iat",
                "exp",
                "iss",
            ],
        },
    )

    if payload.get("type") != expected_type:
        raise InvalidTokenError("Invalid token type")

    return payload
