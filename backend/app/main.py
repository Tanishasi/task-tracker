from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .models import Base
from .routers import inputs, users
from .config import settings
from .utils import engine

app = FastAPI(title="Unstructured Input Dashboard")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_allow_origins.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


app.include_router(users.router)
app.include_router(inputs.router)
