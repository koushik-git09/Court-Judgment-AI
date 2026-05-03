from __future__ import annotations

from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from db import get_cases_collection
from services.auth_service import get_current_user
from services.ai_service import generate_ai_analysis
from services.extraction_service import ExtractedFields


router = APIRouter(tags=["verify"], dependencies=[Depends(get_current_user)])


class VerifyRequest(BaseModel):
    case_id: str
    status: str  # "approved" or "rejected"


@router.post("/verify")
async def verify_case(data: VerifyRequest):
    try:
        case_object_id = ObjectId(data.case_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid case_id") from exc

    case_doc = await get_cases_collection().find_one({"_id": case_object_id})
    if not case_doc:
        raise HTTPException(status_code=404, detail="Case not found")

    update_fields = {
        "status": data.status,
        "verified_at": datetime.now(timezone.utc),
    }
    unset_fields: dict[str, str] = {}

    if data.status == "approved":
        extracted = ExtractedFields(
            case_number=case_doc.get("case_number"),
            court_name=case_doc.get("court_name_detected") or case_doc.get("court_name"),
            order_date=case_doc.get("order_date"),
            parties=case_doc.get("parties"),
        )
        analysis = generate_ai_analysis(case_doc.get("extracted_text") or "", extracted)
        update_fields["action_plan"] = {
            "summary": analysis.summary,
            "action": analysis.action,
            "deadline": analysis.deadline,
            "department": analysis.department,
            "risk": analysis.risk,
            "confidence": round(analysis.confidence / 100, 2),
        }
    else:
        unset_fields["action_plan"] = ""

    update_doc: dict[str, dict[str, object]] = {"$set": update_fields}
    if unset_fields:
        update_doc["$unset"] = unset_fields

    result = await get_cases_collection().update_one({"_id": case_object_id}, update_doc)

    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Case already has this status")

    return {"message": f"Case {data.status} successfully"}
