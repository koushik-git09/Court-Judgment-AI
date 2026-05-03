from __future__ import annotations

import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from motor.motor_asyncio import (
    AsyncIOMotorClient,
    AsyncIOMotorCollection,
    AsyncIOMotorDatabase,
)

# Load environment variables early so imports (e.g., from main.py) reliably
# pick up MONGODB_URI from a local `.env` file.
_BACKEND_ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_BACKEND_ENV_PATH, override=False)
load_dotenv(override=False)

_MONGO_CLIENT: Optional[AsyncIOMotorClient] = None


def _get_mongodb_uri() -> str:
    # Prefer MONGODB_URI, fall back to MONGO_URI.
    # Local default works for a local MongoDB instance.
    return os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or "mongodb://localhost:27017"


def get_mongo_client() -> AsyncIOMotorClient:
    """Get a reusable Motor client (singleton).

    Safe to call from multiple requests; the underlying client is thread-safe.
    """

    global _MONGO_CLIENT
    if _MONGO_CLIENT is None:
        _MONGO_CLIENT = AsyncIOMotorClient(_get_mongodb_uri())
    return _MONGO_CLIENT


def get_database() -> AsyncIOMotorDatabase:
    """Return the application database handle: `court_db`."""

    return get_mongo_client()["court_db"]


def get_cases_collection() -> AsyncIOMotorCollection:
    """Return the `cases` collection handle."""

    return get_database()["cases"]


def get_users_collection() -> AsyncIOMotorCollection:
    """Return the `users` collection handle."""

    return get_database()["users"]


async def close_mongo_client() -> None:
    """Close the MongoDB client on shutdown."""

    global _MONGO_CLIENT
    if _MONGO_CLIENT is not None:
        _MONGO_CLIENT.close()
        _MONGO_CLIENT = None
