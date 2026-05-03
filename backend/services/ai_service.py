from __future__ import annotations

import re
from typing import Optional

from pydantic import BaseModel, Field

from services.extraction_service import ExtractedFields


class AIAnalysis(BaseModel):
    summary: str
    action: str
    deadline: str
    department: str
    risk: str
    confidence: float = Field(ge=0, le=100)
    parties: Optional[str] = None
    order_date: Optional[str] = None
    case_number: Optional[str] = None
    reasoning: list[str] = Field(default_factory=list)
    evidence: list[str] = Field(default_factory=list)
    extraction_engine: Optional[str] = None
    spacy_model: Optional[str] = None
    spacy_ran: Optional[bool] = None


def _clean_for_analysis(text: str) -> str:
    # Keep a lower-cased, whitespace-normalized copy for keyword checks.
    return re.sub(r"\s+", " ", text).strip().lower()


def _first_sentences(text: str, count: int = 2) -> str:
    compact = re.sub(r"\s+", " ", text).strip()
    if not compact:
        return ""

    # Split on sentence-ish boundaries.
    parts = re.split(r"(?<=[.!?])\s+", compact)
    return " ".join([p.strip() for p in parts[:count] if p.strip()])


def _extract_deadline_days(clean_text: str) -> Optional[int]:
    patterns = [
        r"\bwithin\s*(\d{1,3})\s*days\b",
        r"\bwithin\s*(\d{1,3})\s*weeks\b",
        r"\bwithin\s*(\d{1,2})\s*months\b",
        r"\b(\d{1,3})\s*days\b",
    ]

    for pat in patterns:
        m = re.search(pat, clean_text)
        if not m:
            continue

        n = int(m.group(1))
        if "weeks" in pat:
            return n * 7
        if "months" in pat:
            return n * 30
        return n

    return None


def _risk_from_days(days: int) -> str:
    if days <= 5:
        return "High"
    if days <= 15:
        return "Medium"
    return "Low"


def _department_from_text(clean_text: str) -> str:
    if "revenue" in clean_text:
        return "Revenue Department"
    if "tax" in clean_text or "gst" in clean_text:
        return "Finance Department"
    if "police" in clean_text or "fir" in clean_text:
        return "Home Department"
    return "Legal Department"


def _snip(text: str, needle: str, window: int = 140) -> Optional[str]:
    idx = text.lower().find(needle.lower())
    if idx < 0:
        return None
    start = max(0, idx - window // 2)
    end = min(len(text), idx + len(needle) + window // 2)
    snippet = text[start:end].strip()
    return re.sub(r"\s+", " ", snippet)


def generate_ai_analysis(text: str, extracted: ExtractedFields) -> AIAnalysis:
    """Generate structured analysis from extracted judgment text.

    Note: This is a rules-based analyzer (no external LLM call).
    """

    clean = _clean_for_analysis(text)

    summary = _first_sentences(text, count=2)

    reasoning: list[str] = []
    evidence: list[str] = []

    # Action
    if re.search(r"\bappeal\b", clean):
        action = "Consider Appeal"
        reasoning.append("Detected keyword 'appeal' → action set to Consider Appeal.")
        sn = _snip(text, "appeal")
        if sn:
            evidence.append(sn)
    elif re.search(r"\bcomply\b|\bcompliance\b", clean):
        action = "Compliance Required"
        reasoning.append("Detected keyword 'comply/compliance' → action set to Compliance Required.")
        sn = _snip(text, "comply") or _snip(text, "compliance")
        if sn:
            evidence.append(sn)
    elif re.search(r"\bpay\b|\bpayment\b", clean):
        action = "Payment Required"
        reasoning.append("Detected payment-related language → action set to Payment Required.")
        sn = _snip(text, "pay") or _snip(text, "payment")
        if sn:
            evidence.append(sn)
    else:
        action = "Review Required"
        reasoning.append("No explicit action keyword found → action set to Review Required.")

    # Deadline
    days = _extract_deadline_days(clean)
    if days is None:
        days = 30
        reasoning.append("No explicit deadline found → defaulted to 30 days.")
    else:
        reasoning.append(f"Extracted deadline from text → {days} days.")
        m = re.search(r"\bwithin\s*\d{1,3}\s*(?:days|weeks|months)\b|\b\d{1,3}\s*days\b", clean)
        if m:
            evidence.append(m.group(0))

    deadline = f"{days} days"

    department = _department_from_text(clean)
    if department != "Legal Department":
        reasoning.append(f"Detected department keyword → {department}.")

    risk = _risk_from_days(days)
    reasoning.append(f"Computed risk from deadline ({days} days) → {risk}.")

    # Confidence (simple heuristic)
    confidence = 55.0
    if extracted.case_number:
        confidence += 10
    if extracted.order_date:
        confidence += 10
    if extracted.parties:
        confidence += 10
    if days != 30:
        confidence += 10
    if action != "Review Required":
        confidence += 5
    confidence = min(95.0, confidence)

    if extracted.case_number:
        reasoning.append("Case number extracted successfully.")
    if extracted.order_date:
        reasoning.append("Order date extracted successfully.")
    if extracted.parties:
        reasoning.append("Parties extracted successfully.")

    return AIAnalysis(
        summary=summary,
        action=action,
        deadline=deadline,
        department=department,
        risk=risk,
        confidence=confidence,
        parties=extracted.parties,
        order_date=extracted.order_date,
        case_number=extracted.case_number,
        reasoning=reasoning,
        evidence=evidence,
    )
