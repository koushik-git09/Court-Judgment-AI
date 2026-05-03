from __future__ import annotations

import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Optional, TypedDict

from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from db import get_users_collection
from models.user_model import UserRole

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
_bearer = HTTPBearer(auto_error=False)


def _bcrypt_password_len_ok(password: str) -> bool:
    # bcrypt only uses the first 72 bytes; passlib/bcrypt raises if longer.
    try:
        return len(password.encode("utf-8")) <= 72
    except Exception:
        return False


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _normalize_email(email: str) -> str:
    return (email or "").strip().lower()


def _get_jwt_secret() -> str:
    secret = os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY")
    if not secret:
        # Dev fallback so the app runs locally; override in production.
        return "CHANGE_ME_DEV_ONLY"
    return secret


def _get_jwt_algorithm() -> str:
    return os.getenv("JWT_ALGORITHM", "HS256")


def _get_access_token_exp_minutes() -> int:
    raw = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
    try:
        return max(5, int(raw))
    except Exception:
        return 1440


async def ensure_user_indexes() -> None:
    """Ensure required indexes exist (unique email)."""

    # Unique email index. Store normalized emails only.
    await get_users_collection().create_index("email", unique=True)


def hash_password(password: str) -> str:
    if not _bcrypt_password_len_ok(password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password too long (max 72 bytes)",
        )
    return _pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return _pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


def create_access_token(*, user_id: str, role: UserRole) -> str:
    exp = _utcnow() + timedelta(minutes=_get_access_token_exp_minutes())
    payload = {
        "sub": user_id,
        "role": role,
        "exp": exp,
        "iat": _utcnow(),
    }
    return jwt.encode(payload, _get_jwt_secret(), algorithm=_get_jwt_algorithm())


async def request_access(*, name: str, email: str, password: str, role: UserRole) -> str:
    normalized_email = _normalize_email(email)

    # Bootstrap: in dev environments, allow the *first* admin account to be auto-approved
    # so the system can be accessed without an existing admin to approve it.
    app_env = (os.getenv("APP_ENV") or "dev").lower()
    bootstrap_allowed = app_env in {"dev", "local"}
    is_approved = False

    if bootstrap_allowed and role == "admin":
        existing_approved_admin = await get_users_collection().find_one(
            {"role": "admin", "is_approved": True}
        )
        if not existing_approved_admin:
            is_approved = True

    user_doc: dict[str, Any] = {
        "name": name.strip(),
        "email": normalized_email,
        "password": hash_password(password),
        "role": role,
        "is_approved": is_approved,
        "created_at": _utcnow(),
    }

    try:
        result = await get_users_collection().insert_one(user_doc)
    except Exception as exc:
        # Most commonly duplicate email.
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        ) from exc

    return str(result.inserted_id)


async def approve_user(*, user_id: str) -> None:
    try:
        oid = ObjectId(user_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid user id") from exc

    result = await get_users_collection().update_one(
        {"_id": oid},
        {"$set": {"is_approved": True}},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

class LoginResult(TypedDict):
    access_token: str
    role: UserRole
    user_id: str


async def login(*, email: str, password: str) -> LoginResult:
    if not _bcrypt_password_len_ok(password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password too long (max 72 bytes)",
        )

    normalized_email = _normalize_email(email)
    user = await get_users_collection().find_one({"email": normalized_email})

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.get("is_approved", False):
        raise HTTPException(status_code=403, detail="User not approved")

    user_id = str(user["_id"])
    role: UserRole = user.get("role")

    token = create_access_token(user_id=user_id, role=role)

    return {
        "access_token": token,
        "role": role,
        "user_id": user_id,
    }


async def forgot_password(*, email: str) -> Optional[str]:
    normalized_email = _normalize_email(email)
    user = await get_users_collection().find_one({"email": normalized_email})

    # Always return success message to avoid email enumeration.
    if not user:
        return None

    token = secrets.token_urlsafe(32)

    await get_users_collection().update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "reset_token": token,
                "reset_token_created_at": _utcnow(),
            }
        },
    )

    # For this project we return the token directly (no email integration).
    return token


async def reset_password(*, token: str, new_password: str) -> None:
    user = await get_users_collection().find_one({"reset_token": token})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid reset token")

    await get_users_collection().update_one(
        {"_id": user["_id"]},
        {
            "$set": {"password": hash_password(new_password)},
            "$unset": {"reset_token": "", "reset_token_created_at": ""},
        },
    )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> dict[str, Any]:
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            _get_jwt_secret(),
            algorithms=[_get_jwt_algorithm()],
        )
        raw_user_id = payload.get("sub")
        raw_role = payload.get("role")
        if not isinstance(raw_user_id, str) or not raw_user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        if not isinstance(raw_role, str) or not raw_role:
            raise HTTPException(status_code=401, detail="Invalid token")

        user_id: str = raw_user_id
        role: str = raw_role
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc

    try:
        oid = ObjectId(user_id)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc

    user = await get_users_collection().find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    if not user.get("is_approved", False):
        raise HTTPException(status_code=403, detail="User not approved")

    # Normalize for downstream usage.
    user["_id"] = str(user["_id"])
    user["role"] = user.get("role")

    return user


def require_role(required: UserRole):
    async def _dep(user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
        if user.get("role") != required:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user

    return _dep
