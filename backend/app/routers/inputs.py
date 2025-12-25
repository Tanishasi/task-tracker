from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud
from ..models import User
from ..schemas import InputCreate, InputRead, InputUpdate
from ..utils import get_current_user, get_db

router = APIRouter(prefix="/inputs", tags=["inputs"])


@router.post("", response_model=InputRead)
def create_input(
    payload: InputCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.create_input(db, user_id=current_user.id, payload=payload)


@router.get("", response_model=list[InputRead])
def list_inputs(
    order: str = "dashboard",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if order not in {"dashboard", "category", "created_at"}:
        raise HTTPException(status_code=400, detail="Invalid order")
    return crud.list_inputs(db, user_id=current_user.id, order=order)


@router.get("/dashboard", response_model=list[InputRead])
def dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.list_inputs(db, user_id=current_user.id, order="dashboard")


@router.get("/{input_id}", response_model=InputRead)
def get_input(
    input_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = crud.get_input_for_user(db, user_id=current_user.id, input_id=input_id)
    if not item:
        raise HTTPException(status_code=404, detail="Input not found")
    return item


@router.patch("/{input_id}", response_model=InputRead)
def update_input(
    input_id: int,
    payload: InputUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = crud.get_input_for_user(db, user_id=current_user.id, input_id=input_id)
    if not item:
        raise HTTPException(status_code=404, detail="Input not found")
    return crud.update_input(db, item=item, payload=payload)


@router.delete("/{input_id}")
def delete_input(
    input_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = crud.get_input_for_user(db, user_id=current_user.id, input_id=input_id)
    if not item:
        raise HTTPException(status_code=404, detail="Input not found")
    crud.soft_delete_input(db, item=item)
    return {"status": "deleted"}
