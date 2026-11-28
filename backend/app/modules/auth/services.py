"""Business logic for user authentication and refresh-token sessions."""

from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

from jwt import InvalidTokenError
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    hash_refresh_token,
    password_needs_rehash,
    verify_password,
)
from app.modules.auth.models import RefreshSession
from app.modules.auth.schemas import (
    AuthResponse,
    LoginRequest,
    MessageResponse,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.modules.users.models import User

# ---------------------------------------------------------------------------
# Business exceptions
# ---------------------------------------------------------------------------


class AuthServiceError(Exception):
    """Base exception for authentication business errors."""


class EmailAlreadyRegisteredError(AuthServiceError):
    """Raised when an email address is already registered."""


class UsernameAlreadyTakenError(AuthServiceError):
    """Raised when a username is already taken."""


class InvalidCredentialsError(AuthServiceError):
    """Raised when the email or password is incorrect."""


class InactiveUserError(AuthServiceError):
    """Raised when an inactive user tries to authenticate."""


class InvalidRefreshTokenError(AuthServiceError):
    """Raised when a refresh token is invalid, expired or revoked."""


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _utc_now_naive() -> datetime:
    """Return the current UTC time without timezone information.

    RefreshSession uses DateTime(timezone=False), so timestamps are stored
    as naive UTC values.
    """
    return datetime.now(UTC).replace(tzinfo=None)


def _create_session_tokens(
    db: Session,
    user: User,
) -> tuple[str, str]:
    """Create a refresh session and its access/refresh tokens."""

    session_id = uuid4()

    refresh_token = create_refresh_token(user.id, session_id)
    access_token = create_access_token(user.id, session_id)

    refresh_session = RefreshSession(
        id=session_id,
        user_id=user.id,
        token_hash=hash_refresh_token(refresh_token),
        expires_at=_utc_now_naive()
        + timedelta(days=settings.refresh_token_expire_days),
    )

    db.add(refresh_session)

    return access_token, refresh_token


def _decode_refresh_claims(refresh_token: str) -> tuple[UUID, UUID]:
    """Validate a refresh JWT and extract its user/session identifiers."""

    try:
        claims = decode_token(refresh_token, expected_type="refresh")

        user_id = claims.get("sub")
        session_id = claims.get("sid")

        if not isinstance(user_id, str) or not isinstance(session_id, str):
            raise InvalidRefreshTokenError("Invalid refresh token claims")

        return UUID(user_id), UUID(session_id)

    except (InvalidTokenError, ValueError, TypeError) as exc:
        raise InvalidRefreshTokenError("Invalid refresh token") from exc


def _build_auth_response(
    user: User,
    access_token: str,
    refresh_token: str,
) -> AuthResponse:
    """Build the complete authentication response."""

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.access_token_expire_minutes * 60,
        user=UserResponse.model_validate(user),
    )


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------


def register_user(
    db: Session,
    payload: RegisterRequest,
) -> AuthResponse:
    """Register a new user and create an authentication session."""

    email = str(payload.email)
    username = payload.username

    existing_email = db.scalar(select(User.id).where(User.email == email))
    if existing_email is not None:
        raise EmailAlreadyRegisteredError("Email already registered")

    existing_username = db.scalar(select(User.id).where(User.username == username))
    if existing_username is not None:
        raise UsernameAlreadyTakenError("Username already taken")

    user = User(
        username=username,
        email=email,
        hashed_password=hash_password(payload.password.get_secret_value()),
    )

    db.add(user)

    try:
        # Insert the user first so its UUID is available for the session.
        db.flush()

    except IntegrityError:
        db.rollback()

        # Handle a possible concurrent registration.
        if db.scalar(select(User.id).where(User.email == email)) is not None:
            raise EmailAlreadyRegisteredError("Email already registered")

        if db.scalar(select(User.id).where(User.username == username)) is not None:
            raise UsernameAlreadyTakenError("Username already taken")

        raise

    try:
        access_token, refresh_token = _create_session_tokens(db, user)
        db.commit()
        db.refresh(user)

    except Exception:
        db.rollback()
        raise

    return _build_auth_response(user, access_token, refresh_token)


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------


def login_user(
    db: Session,
    payload: LoginRequest,
) -> AuthResponse:
    """Authenticate a user and create a new refresh session."""

    email = str(payload.email)
    password = payload.password.get_secret_value()

    user = db.scalar(select(User).where(User.email == email))

    # Keep the same error for an unknown email and an incorrect password.
    if user is None or not verify_password(password, user.hashed_password):
        raise InvalidCredentialsError("Invalid email or password")

    if not user.is_active:
        raise InactiveUserError("This account is inactive")

    # Upgrade the stored hash when Argon2 parameters have changed.
    if password_needs_rehash(user.hashed_password):
        user.hashed_password = hash_password(password)

    try:
        access_token, refresh_token = _create_session_tokens(db, user)
        db.commit()
        db.refresh(user)

    except Exception:
        db.rollback()
        raise

    return _build_auth_response(user, access_token, refresh_token)


# ---------------------------------------------------------------------------
# Refresh token rotation
# ---------------------------------------------------------------------------


def refresh_access_tokens(
    db: Session,
    payload: RefreshRequest,
) -> TokenResponse:
    """Rotate a refresh token while keeping the same session identifier."""

    refresh_token = payload.refresh_token.get_secret_value()
    user_id, session_id = _decode_refresh_claims(refresh_token)

    refresh_session = db.get(RefreshSession, session_id)

    if (
        refresh_session is None
        or refresh_session.user_id != user_id
        or refresh_session.revoked_at is not None
    ):
        raise InvalidRefreshTokenError("Refresh session not found or revoked")

    now = _utc_now_naive()

    if refresh_session.expires_at <= now:
        refresh_session.revoked_at = now
        db.commit()
        raise InvalidRefreshTokenError("Refresh session expired")

    presented_token_hash = hash_refresh_token(refresh_token)

    if refresh_session.token_hash != presented_token_hash:
        # An older refresh token was reused. Revoke the entire session.
        refresh_session.revoked_at = now
        db.commit()
        raise InvalidRefreshTokenError("Refresh token reuse detected")

    user = db.get(User, user_id)

    if user is None:
        refresh_session.revoked_at = now
        db.commit()
        raise InvalidRefreshTokenError("User not found")

    if not user.is_active:
        raise InactiveUserError("This account is inactive")

    # Keep the same session ID, but replace the stored refresh-token hash.
    new_refresh_token = create_refresh_token(user.id, refresh_session.id)
    new_access_token = create_access_token(user.id, refresh_session.id)

    refresh_session.token_hash = hash_refresh_token(new_refresh_token)
    refresh_session.expires_at = now + timedelta(
        days=settings.refresh_token_expire_days
    )

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        expires_in=settings.access_token_expire_minutes * 60,
    )


# ---------------------------------------------------------------------------
# Logout
# ---------------------------------------------------------------------------


def logout_user(
    db: Session,
    payload: RefreshRequest,
) -> MessageResponse:
    """Revoke the refresh session associated with the supplied token."""

    refresh_token = payload.refresh_token.get_secret_value()
    user_id, session_id = _decode_refresh_claims(refresh_token)

    refresh_session = db.get(RefreshSession, session_id)

    if (
        refresh_session is None
        or refresh_session.user_id != user_id
        or refresh_session.revoked_at is not None
    ):
        raise InvalidRefreshTokenError("Refresh session not found or revoked")

    refresh_session.revoked_at = _utc_now_naive()

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    return MessageResponse(message="Successfully logged out")
