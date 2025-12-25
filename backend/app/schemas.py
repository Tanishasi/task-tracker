from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field
from pydantic.config import ConfigDict

from .models import Category, Intent, Severity, Source, Status


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr


class InputCreate(BaseModel):
    text: str = Field(min_length=1)


class InputUpdate(BaseModel):
    text: str | None = None
    category: Category | None = None
    intent: Intent | None = None
    severity: Severity | None = None
    source: Source | None = None
    status: Status | None = None


class InputRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    text: str
    category: Category
    intent: Intent
    severity: Severity
    source: Source
    status: Status
    created_at: datetime | None
