"""HTTP integration tests for authentication endpoints."""

from fastapi.testclient import TestClient

PASSWORD = "StrongTestPassword123!"
EMAIL = "api-test@example.com"
USERNAME = "api_test_user"


def register_payload(
    username: str = USERNAME,
    email: str = EMAIL,
) -> dict[str, str]:
    return {
        "username": username,
        "email": email,
        "password": PASSWORD,
    }


def test_register_endpoint(client: TestClient):
    response = client.post(
        "/api/v1/auth/register",
        json=register_payload(),
    )

    assert response.status_code == 201

    data = response.json()

    assert data["token_type"] == "bearer"
    assert data["access_token"]
    assert data["refresh_token"]
    assert data["user"]["email"] == EMAIL
    assert data["user"]["username"] == USERNAME

    # The password hash must never be exposed.
    assert "hashed_password" not in data["user"]


def test_register_rejects_duplicate_email(client: TestClient):
    client.post(
        "/api/v1/auth/register",
        json=register_payload(),
    )

    response = client.post(
        "/api/v1/auth/register",
        json=register_payload(
            username="another_user",
            email=EMAIL,
        ),
    )

    assert response.status_code == 409


def test_login_endpoint(client: TestClient):
    client.post(
        "/api/v1/auth/register",
        json=register_payload(),
    )

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": EMAIL,
            "password": PASSWORD,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["access_token"]
    assert data["refresh_token"]
    assert data["user"]["email"] == EMAIL


def test_login_rejects_invalid_password(client: TestClient):
    client.post(
        "/api/v1/auth/register",
        json=register_payload(),
    )

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": EMAIL,
            "password": "IncorrectPassword123!",
        },
    )

    assert response.status_code == 401


def test_profile_requires_authentication(client: TestClient):
    response = client.get("/api/v1/auth/me")

    assert response.status_code == 401


def test_profile_with_valid_access_token(client: TestClient):
    registration = client.post(
        "/api/v1/auth/register",
        json=register_payload(),
    )

    access_token = registration.json()["access_token"]

    response = client.get(
        "/api/v1/auth/me",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 200
    assert response.json()["email"] == EMAIL
    assert response.json()["username"] == USERNAME


def test_refresh_endpoint_rotates_tokens(client: TestClient):
    registration = client.post(
        "/api/v1/auth/register",
        json=register_payload(),
    )

    old_refresh_token = registration.json()["refresh_token"]

    response = client.post(
        "/api/v1/auth/refresh",
        json={
            "refresh_token": old_refresh_token,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["access_token"]
    assert data["refresh_token"]
    assert data["refresh_token"] != old_refresh_token


def test_logout_revokes_authentication_session(client: TestClient):
    registration = client.post(
        "/api/v1/auth/register",
        json=register_payload(),
    )

    data = registration.json()

    access_token = data["access_token"]
    refresh_token = data["refresh_token"]

    logout_response = client.post(
        "/api/v1/auth/logout",
        json={
            "refresh_token": refresh_token,
        },
    )

    assert logout_response.status_code == 200

    # The previous access token must also become invalid.
    profile_response = client.get(
        "/api/v1/auth/me",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert profile_response.status_code == 401


def test_refresh_rejects_reused_token(client: TestClient):
    registration = client.post(
        "/api/v1/auth/register",
        json=register_payload(),
    )

    old_refresh_token = registration.json()["refresh_token"]

    first_refresh = client.post(
        "/api/v1/auth/refresh",
        json={
            "refresh_token": old_refresh_token,
        },
    )

    assert first_refresh.status_code == 200

    new_refresh_token = first_refresh.json()["refresh_token"]

    # Reusing the old token must invalidate the session.
    replay_response = client.post(
        "/api/v1/auth/refresh",
        json={
            "refresh_token": old_refresh_token,
        },
    )

    assert replay_response.status_code == 401

    # The previously issued replacement token must now be invalid too.
    second_response = client.post(
        "/api/v1/auth/refresh",
        json={
            "refresh_token": new_refresh_token,
        },
    )

    assert second_response.status_code == 401
