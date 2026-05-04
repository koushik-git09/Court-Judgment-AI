from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field


UserRole = Literal["admin", "verifier", "department"]


class UserBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    role: UserRole
    department: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(min_length=6, max_length=72)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserPublic(UserBase):
    id: str = Field(alias="_id")
    is_approved: bool
    created_at: datetime

    class Config:
        # Pydantic v2
        populate_by_name = True
        # Pydantic v1
        allow_population_by_field_name = True


class RequestAccessResponse(BaseModel):
    user_id: str
    is_approved: bool


class LoginResponse(BaseModel):
    access_token: str
    role: UserRole
    user_id: str
    department: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6, max_length=72)


class PendingUser(UserPublic):
    reset_token: Optional[str] = None


class ApproveUserResponse(BaseModel):
    message: str


class PendingUsersResponse(BaseModel):
    users: list[UserPublic]
