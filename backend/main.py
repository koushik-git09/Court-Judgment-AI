from __future__ import annotations

import os
from typing import Any
from dotenv import load_dotenv
from fastapi import FastAPI, Response
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


def _get_cors_origins() -> list[str]:
    """Return allowed CORS origins.

    Configure with `CORS_ORIGINS` as a comma-separated list, e.g.
    "https://myapp.vercel.app,https://myapp-git-main.vercel.app".
    """

    raw = (os.getenv("CORS_ORIGINS") or "").strip()
    if raw:
        return [origin.strip() for origin in raw.split(",") if origin.strip()]

    # Dev defaults.
    return [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]


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
    allow_origins=_get_cors_origins(),
    allow_origin_regex=(os.getenv("CORS_ORIGIN_REGEX") or None),
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


@app.head("/", include_in_schema=False)
def root_head() -> Response:
    # Some platforms send HEAD requests for health checks.
    return Response(status_code=200)


# -------------------- ROUTERS --------------------

app.include_router(upload_router)
app.include_router(cases_router)
app.include_router(analyze_router)
app.include_router(verify_router)
app.include_router(auth_router)
