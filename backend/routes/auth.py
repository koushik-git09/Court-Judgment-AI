from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr, Field

from models.user_model import LoginResponse, UserRole
from services.auth_service import (
    approve_user,
    forgot_password,
    login,
    request_access,
    reset_password,
    require_role,
)
from db import get_users_collection


router = APIRouter(prefix="/auth", tags=["auth"])

ADMIN_ROLE: UserRole = "admin"


class RequestAccessRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)
    role: UserRole


@router.post("/request-access")
async def request_access_route(data: RequestAccessRequest) -> dict[str, Any]:
    user_id = await request_access(
        name=data.name,
        email=str(data.email),
        password=data.password,
        role=data.role,
    )
    return {"user_id": user_id, "is_approved": False}


@router.post("/approve-user/{id}")
async def approve_user_route(
    id: str,
    _admin: dict[str, Any] = Depends(require_role(ADMIN_ROLE)),
) -> dict[str, str]:
    await approve_user(user_id=id)
    return {"message": "User approved"}


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)


@router.post("/login", response_model=LoginResponse)
async def login_route(data: LoginRequest) -> LoginResponse:
    result = await login(email=str(data.email), password=data.password)
    return LoginResponse(**result)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


@router.post("/forgot-password")
async def forgot_password_route(data: ForgotPasswordRequest) -> dict[str, str]:
    token = await forgot_password(email=str(data.email))
    if token:
        return {"reset_token": token}
    return {"message": "If that email exists, a reset token was generated."}


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6, max_length=72)


@router.post("/reset-password")
async def reset_password_route(data: ResetPasswordRequest) -> dict[str, str]:
    await reset_password(token=data.token, new_password=data.new_password)
    return {"message": "Password reset successful"}


@router.get("/pending-users")
async def pending_users_route(
    _admin: dict[str, Any] = Depends(require_role(ADMIN_ROLE)),
) -> dict[str, list[dict[str, Any]]]:
    users = await get_users_collection().find({"is_approved": False}).to_list(length=None)
    result: list[dict[str, Any]] = []
    for u in users:
        u["_id"] = str(u["_id"])
        u.pop("password", None)
        u.pop("reset_token", None)
        u.pop("reset_token_created_at", None)
        result.append(u)
    return {"users": result}
