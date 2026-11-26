"""Tests for authentication business services."""

import pytest
from pydantic import SecretStr
from sqlalchemy import select

from app.core.security import verify_password
from app.modules.auth.models import RefreshSession
from app.modules.auth.schemas import LoginRequest, RefreshRequest, RegisterRequest
from app.modules.auth.services import (
    EmailAlreadyRegisteredError,
    InvalidCredentialsError,
    InvalidRefreshTokenError,
    UsernameAlreadyTakenError,
    login_user,
    logout_user,
    refresh_access_tokens,
    register_user,
)
from app.modules.users.models import User

PASSWORD = "StrongTestPassword123!"


def make_register_payload(
    username: str = "test_user",
    email: str = "test@example.com",
) -> RegisterRequest:
    return RegisterRequest(
        username=username,
        email=email,
        password=SecretStr(PASSWORD),
    )


def test_register_user_creates_user_and_tokens(db_session):
    response = register_user(
        db_session,
        make_register_payload(),
    )

    user = db_session.scalar(select(User).where(User.email == "test@example.com"))

    assert user is not None
    assert user.username == "test_user"
    assert user.hashed_password != PASSWORD
    assert verify_password(PASSWORD, user.hashed_password)

    assert response.user.email == "test@example.com"
    assert response.access_token
    assert response.refresh_token
    assert response.expires_in > 0


def test_register_user_rejects_duplicate_email(db_session):
    register_user(db_session, make_register_payload())

    duplicate = make_register_payload(
        username="another_user",
        email="test@example.com",
    )

    with pytest.raises(EmailAlreadyRegisteredError):
        register_user(db_session, duplicate)


def test_register_user_rejects_duplicate_username(db_session):
    register_user(db_session, make_register_payload())

    duplicate = make_register_payload(
        username="test_user",
        email="another@example.com",
    )

    with pytest.raises(UsernameAlreadyTakenError):
        register_user(db_session, duplicate)


def test_login_user_with_valid_credentials(db_session):
    register_user(db_session, make_register_payload())

    response = login_user(
        db_session,
        LoginRequest(
            email="test@example.com",
            password=SecretStr(PASSWORD),
        ),
    )

    assert response.user.email == "test@example.com"
    assert response.access_token
    assert response.refresh_token


def test_login_user_rejects_wrong_password(db_session):
    register_user(db_session, make_register_payload())

    with pytest.raises(InvalidCredentialsError):
        login_user(
            db_session,
            LoginRequest(
                email="test@example.com",
                password=SecretStr("WrongPassword123!"),
            ),
        )


def test_refresh_token_rotation(db_session):
    registered = register_user(
        db_session,
        make_register_payload(),
    )

    first_refresh = registered.refresh_token

    rotated = refresh_access_tokens(
        db_session,
        RefreshRequest(refresh_token=SecretStr(first_refresh)),
    )

    assert rotated.access_token
    assert rotated.refresh_token
    assert rotated.refresh_token != first_refresh

    # The newly issued token must also be usable.
    second_rotation = refresh_access_tokens(
        db_session,
        RefreshRequest(refresh_token=SecretStr(rotated.refresh_token)),
    )

    assert second_rotation.refresh_token != rotated.refresh_token


def test_reusing_old_refresh_token_revokes_session(db_session):
    registered = register_user(
        db_session,
        make_register_payload(),
    )

    old_refresh_token = registered.refresh_token

    rotated = refresh_access_tokens(
        db_session,
        RefreshRequest(refresh_token=SecretStr(old_refresh_token)),
    )

    # Reusing the previous token must revoke the session.
    with pytest.raises(InvalidRefreshTokenError):
        refresh_access_tokens(
            db_session,
            RefreshRequest(refresh_token=SecretStr(old_refresh_token)),
        )

    # The latest token must also be rejected after session revocation.
    with pytest.raises(InvalidRefreshTokenError):
        refresh_access_tokens(
            db_session,
            RefreshRequest(refresh_token=SecretStr(rotated.refresh_token)),
        )


def test_logout_revokes_refresh_session(db_session):
    registered = register_user(
        db_session,
        make_register_payload(),
    )

    result = logout_user(
        db_session,
        RefreshRequest(refresh_token=SecretStr(registered.refresh_token)),
    )

    assert result.message == "Successfully logged out"

    session = db_session.scalar(
        select(RefreshSession).where(RefreshSession.user_id == registered.user.id)
    )

    assert session is not None
    assert session.revoked_at is not None

    with pytest.raises(InvalidRefreshTokenError):
        refresh_access_tokens(
            db_session,
            RefreshRequest(refresh_token=SecretStr(registered.refresh_token)),
        )
