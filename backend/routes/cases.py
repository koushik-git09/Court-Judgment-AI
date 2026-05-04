from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from db import get_cases_collection
from services.auth_service import get_current_user


router = APIRouter(tags=["cases"], dependencies=[Depends(get_current_user)])


@router.get("/cases")
async def list_cases(
    status: str | None = Query(default=None),
    department: str | None = Query(default=None),
) -> list[dict[str, Any]]:
    query: dict[str, Any] = {}
    if status and status.strip():
        query["status"] = status.strip()
    if department and department.strip():
        raw = department.strip()
        parts = [p.strip() for p in raw.split(",") if p.strip()]
        if len(parts) == 1:
            query["department"] = parts[0]
        elif len(parts) > 1:
            query["department"] = {"$in": parts}

    cases = await get_cases_collection().find(query).to_list(length=None)

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


class UpdateActionPlanRequest(BaseModel):
    summary: str | None = None
    action: str | None = None
    deadline: str | None = None
    department: str | None = None
    risk: str | None = None


@router.patch("/cases/{case_id}/action-plan")
async def update_action_plan(case_id: str, data: UpdateActionPlanRequest):
    try:
        case_object_id = ObjectId(case_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid case_id") from exc

    update_fields: dict[str, Any] = {}

    if data.summary is not None:
        update_fields["action_plan.summary"] = data.summary
    if data.action is not None:
        update_fields["action_plan.action"] = data.action
    if data.deadline is not None:
        update_fields["action_plan.deadline"] = data.deadline
    if data.department is not None:
        update_fields["action_plan.department"] = data.department
        # Keep the root department in sync for routing/filtering.
        update_fields["department"] = data.department
    if data.risk is not None:
        update_fields["action_plan.risk"] = data.risk

    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields provided")

    result = await get_cases_collection().update_one(
        {"_id": case_object_id},
        {"$set": update_fields},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Case not found")

    return {"message": "Action plan updated"}
