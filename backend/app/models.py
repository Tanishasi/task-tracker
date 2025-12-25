from __future__ import annotations

from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.types import Enum as SAEnum


class Base(DeclarativeBase):
    pass


class Category(str, Enum):
    issue = "issue"
    event = "event"
    log = "log"
    task = "task"
    incident = "incident"
    note = "note"


class Intent(str, Enum):
    todo = "todo"
    warning = "warning"
    deadline = "deadline"
    information = "information"
    question = "question"
    unknown = "unknown"


class Severity(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    unknown = "unknown"


class Source(str, Enum):
    human = "human"
    machine = "machine"
    vendor = "vendor"
    unknown = "unknown"


class Status(str, Enum):
    open = "open"
    done = "done"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    inputs: Mapped[list[Input]] = relationship(back_populates="user")


class Input(Base):
    __tablename__ = "inputs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)

    text: Mapped[str] = mapped_column(String, nullable=False)

    category: Mapped[Category] = mapped_column(SAEnum(Category), default=Category.note, nullable=False)
    intent: Mapped[Intent] = mapped_column(SAEnum(Intent), default=Intent.unknown, nullable=False)
    severity: Mapped[Severity] = mapped_column(SAEnum(Severity), default=Severity.unknown, nullable=False)
    source: Mapped[Source] = mapped_column(SAEnum(Source), default=Source.unknown, nullable=False)
    status: Mapped[Status] = mapped_column(SAEnum(Status), default=Status.open, nullable=False)

    created_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, server_default=func.now()
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped[User] = relationship(back_populates="inputs")
