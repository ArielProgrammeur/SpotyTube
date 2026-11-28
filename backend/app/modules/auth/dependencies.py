"""FastAPI dependencies for authentication and authorization."""

from datetime import UTC, datetime
from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidTokenError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token
from app.modules.auth.models import RefreshSession
from app.modules.users.models import User

# HTTP Bearer authentication.
# auto_error=False lets us return a consistent 401 response ourselves.
bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """Validate the access token and return its active user."""

    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None or credentials.scheme.lower() != "bearer":
        raise unauthorized

    try:
        claims = decode_token(
            credentials.credentials,
            expected_type="access",
        )

        subject = claims.get("sub")
        session_claim = claims.get("sid")

        if not isinstance(subject, str) or not isinstance(session_claim, str):
            raise unauthorized

        user_id = UUID(subject)
        session_id = UUID(session_claim)

    except (InvalidTokenError, ValueError, TypeError):
        raise unauthorized from None

    refresh_session = db.get(RefreshSession, session_id)

    now = datetime.now(UTC).replace(tzinfo=None)

    if (
        refresh_session is None
        or refresh_session.user_id != user_id
        or refresh_session.revoked_at is not None
        or refresh_session.expires_at <= now
    ):
        raise unauthorized

    user = db.get(User, user_id)

    if user is None or not user.is_active:
        raise unauthorized

    return user
