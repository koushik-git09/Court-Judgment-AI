from __future__ import annotations

import os
from typing import Any
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import close_mongo_client, get_mongo_client
from routes.analyze import router as analyze_router
from routes.auth import router as auth_router
from routes.cases import router as cases_router
from routes.upload import router as upload_router
from routes.verify import router as verify_router
from services.auth_service import ensure_user_indexes

load_dotenv()

app = FastAPI(title="Court Judgment Processing API", version="0.1.0")


# -------------------- STARTUP / SHUTDOWN --------------------

@app.on_event("startup")
async def _startup() -> None:
    get_mongo_client()
    await ensure_user_indexes()


@app.on_event("shutdown")
async def _shutdown() -> None:
    await close_mongo_client()


# -------------------- CORS --------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------- ROOT --------------------

@app.get("/")
def root() -> dict[str, Any]:
    return {
        "ok": True,
        "service": "court-judgment-backend",
        "env": os.getenv("APP_ENV", "dev"),
    }


# -------------------- ROUTERS --------------------

app.include_router(upload_router)
app.include_router(cases_router)
app.include_router(analyze_router)
app.include_router(verify_router)
app.include_router(auth_router)
