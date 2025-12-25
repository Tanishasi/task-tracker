from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import case, desc, func, select
from sqlalchemy.orm import Session

from .llm import classify_input
from .models import Input, Severity, Status, User
from .schemas import InputCreate, InputUpdate
from .utils import hash_password, verify_password


def create_user(db: Session, email: str, password: str) -> User:
    user = User(email=email, password_hash=hash_password(password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_email(db: Session, email: str) -> User | None:
    stmt = select(User).where(func.lower(User.email) == email.lower())
    return db.execute(stmt).scalars().first()


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def create_input(db: Session, user_id: int, payload: InputCreate) -> Input:
    classification = classify_input(payload.text, source=None)

    item = Input(
        user_id=user_id,
        text=payload.text,
        category=classification.category,
        intent=classification.intent,
        severity=classification.severity,
        source=classification.source,
        status=Status.open,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def get_input_for_user(db: Session, user_id: int, input_id: int) -> Input | None:
    stmt = select(Input).where(
        Input.id == input_id,
        Input.user_id == user_id,
        Input.deleted_at.is_(None),
    )
    return db.execute(stmt).scalars().first()


def update_input(db: Session, item: Input, payload: InputUpdate) -> Input:
    if payload.text is not None:
        item.text = payload.text
        classification = classify_input(item.text, source=payload.source or item.source)
        item.category = payload.category or classification.category
        item.intent = payload.intent or classification.intent
        item.severity = payload.severity or classification.severity
        item.source = payload.source or classification.source
    else:
        if payload.category is not None:
            item.category = payload.category
        if payload.intent is not None:
            item.intent = payload.intent
        if payload.severity is not None:
            item.severity = payload.severity
        if payload.source is not None:
            item.source = payload.source

    if payload.status is not None:
        item.status = payload.status

    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def soft_delete_input(db: Session, item: Input) -> Input:
    item.deleted_at = datetime.now(timezone.utc)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def list_inputs(
    db: Session,
    user_id: int,
    order: str = "dashboard",
) -> list[Input]:
    stmt = select(Input).where(Input.user_id == user_id, Input.deleted_at.is_(None))

    if order == "category":
        stmt = stmt.order_by(Input.category.asc(), desc(Input.created_at))
    elif order == "created_at":
        stmt = stmt.order_by(desc(Input.created_at))
    else:
        high_first = case((Input.severity == Severity.high, 0), else_=1)
        done_last = case((Input.status == Status.done, 1), else_=0)
        stmt = stmt.order_by(high_first.asc(), done_last.asc(), desc(Input.created_at))

    return list(db.execute(stmt).scalars().all())
