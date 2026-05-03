from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from services.ai_service import AIAnalysis, generate_ai_analysis
from services.extraction_service import extract_case_fields_with_meta


router = APIRouter(tags=["analyze"])


class AnalyzeRequest(BaseModel):
    extracted_text: str


@router.post("/analyze", response_model=AIAnalysis)
async def analyze_text(data: AnalyzeRequest) -> AIAnalysis:
    text = data.extracted_text or ""

    extracted, meta = extract_case_fields_with_meta(text)
    analysis = generate_ai_analysis(text, extracted)

    if hasattr(analysis, "model_copy"):
        analysis = analysis.model_copy(
            update={
                "extraction_engine": meta.get("engine"),
                "spacy_model": meta.get("spacy_model"),
                "spacy_ran": meta.get("spacy_ran"),
            }
        )
    else:
        # Pydantic v1 fallback
        analysis = analysis.copy(
            update={
                "extraction_engine": meta.get("engine"),
                "spacy_model": meta.get("spacy_model"),
                "spacy_ran": meta.get("spacy_ran"),
            }
        )

    return analysis
