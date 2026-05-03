from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from db import get_cases_collection
from services.extraction_service import extract_case_fields
from services.pdf_service import extract_text_from_pdf_bytes
from services.auth_service import get_current_user


router = APIRouter(tags=["upload"], dependencies=[Depends(get_current_user)])


@router.post("/upload")
async def upload(
    file: UploadFile = File(...),
    category: str = Form(...),
    court_name: str = Form(...),
) -> dict[str, str]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename")

    content_type = (file.content_type or "").lower()
    if content_type not in {"application/pdf", "application/octet-stream"}:
        raise HTTPException(status_code=415, detail="Only PDF uploads are supported")

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="Empty upload")

    try:
        extracted_text = extract_text_from_pdf_bytes(pdf_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    extracted = extract_case_fields(extracted_text)

    case_doc: dict[str, Any] = {
        "category": category,
        "court_name": court_name,
        "court_name_detected": extracted.court_name,
        "case_number": extracted.case_number,
        "order_date": extracted.order_date,
        "parties": extracted.parties,
        "extracted_text": extracted_text,
        "created_at": datetime.now(timezone.utc),
        "status": "pending_verification",
    }

    insert_result = await get_cases_collection().insert_one(case_doc)

    return {
        "inserted_id": str(insert_result.inserted_id),
        "message": "Case stored successfully",
    }
