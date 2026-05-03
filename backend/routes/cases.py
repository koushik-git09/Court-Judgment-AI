from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from db import get_cases_collection
from services.auth_service import get_current_user


router = APIRouter(tags=["cases"], dependencies=[Depends(get_current_user)])


@router.get("/cases")
async def list_cases() -> list[dict[str, Any]]:
    cases = await get_cases_collection().find({}).to_list(length=None)

    for case in cases:
        if "_id" in case:
            case["_id"] = str(case["_id"])
        if "action_plan" not in case:
            case["action_plan"] = None

    return cases


class CompleteRequest(BaseModel):
    case_id: str


@router.post("/complete")
async def complete_case(data: CompleteRequest):
    try:
        case_object_id = ObjectId(data.case_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid case_id") from exc

    result = await get_cases_collection().update_one(
        {"_id": case_object_id},
        {
            "$set": {
                "status": "completed",
                "completed_at": datetime.now(timezone.utc),
            }
        },
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Case not found")

    return {"message": "Case marked as completed"}
