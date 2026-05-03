from __future__ import annotations

from datetime import date
import re
from typing import Any, Optional

from pydantic import BaseModel


class ExtractedFields(BaseModel):
    case_number: Optional[str] = None
    court_name: Optional[str] = None
    order_date: Optional[str] = None  # ISO date string when possible (YYYY-MM-DD)
    parties: Optional[str] = None


def _first_nonempty_lines(text: str, limit: int = 30) -> list[str]:
    lines = [ln.strip() for ln in text.splitlines()]
    lines = [ln for ln in lines if ln]
    return lines[:limit]


def _to_iso_date(day: int, month: int, year: int) -> Optional[str]:
    try:
        return date(year, month, day).isoformat()
    except Exception:
        return None


def extract_case_number(text: str) -> Optional[str]:
    header = "\n".join(_first_nonempty_lines(text, limit=40))
    patterns = [
        r"\b(?:case\s*no\.?|case\s*number|appeal\s*no\.?|w\.?p\.?\s*no\.?|wp\s*no\.?|c\.?r\.?l\.?\s*no\.?|civil\s*appeal\s*no\.?)\s*[:\-]?\s*([A-Za-z0-9][A-Za-z0-9\-/()\s]{2,60})",
        r"\b(?:s\.l\.p\.?\s*\(c\)\s*no\.?|slp\s*\(c\)\s*no\.?)\s*[:\-]?\s*([A-Za-z0-9][A-Za-z0-9\-/()\s]{2,60})",
    ]

    for pat in patterns:
        m = re.search(pat, header, flags=re.IGNORECASE)
        if m:
            return re.sub(r"\s+", " ", m.group(1)).strip(" -:\t")

    return None


def extract_court_name(text: str) -> Optional[str]:
    lines = _first_nonempty_lines(text, limit=25)

    # Prefer explicit "IN THE ... COURT ..." lines.
    for ln in lines:
        if re.search(r"\bIN\s+THE\b.*\bCOURT\b", ln, flags=re.IGNORECASE):
            return ln.strip()

    # Fallback: any heading line containing "COURT".
    for ln in lines:
        if re.search(r"\bCOURT\b", ln, flags=re.IGNORECASE):
            return ln.strip()

    return None


def extract_order_date(text: str) -> Optional[str]:
    lines = _first_nonempty_lines(text, limit=60)
    header = "\n".join(lines)

    month_map = {
        "january": 1,
        "february": 2,
        "march": 3,
        "april": 4,
        "may": 5,
        "june": 6,
        "july": 7,
        "august": 8,
        "september": 9,
        "october": 10,
        "november": 11,
        "december": 12,
    }

    # Match common Indian date formats.
    date_patterns = [
        r"\b(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})\b",  # dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy
        r"\b(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})\b",  # yyyy-mm-dd, yyyy/mm/dd, yyyy.mm.dd
    ]

    # Month-name formats (e.g., 15th April 2026; dated this the 15th day of April 2026)
    months = "January|February|March|April|May|June|July|August|September|October|November|December"
    month_name_patterns = [
        rf"\b(\d{{1,2}})(?:st|nd|rd|th)?\s+({months})\s+,?\s*(\d{{4}})\b",
        rf"\b(\d{{1,2}})(?:st|nd|rd|th)?\s+day\s+of\s+({months})\s+(\d{{4}})\b",
        rf"\bDATED\s+THIS\s+THE\s+(\d{{1,2}})(?:ST|ND|RD|TH)?\s+DAY\s+OF\s+({months})\s+(\d{{4}})\b",
    ]

    # Prefer dates near keywords.
    keyword_windows = [
        r"(?:dated|date)\s*[:\-]?\s*([0-9]{1,4}[-\/.][0-9]{1,2}[-\/.][0-9]{1,4})",
    ]

    # 1) Strong textual forms first (often present in headings)
    for pat in month_name_patterns:
        try:
            m = re.search(pat, header, flags=re.IGNORECASE)
        except re.error:
            return None
        if not m:
            continue

        day = int(m.group(1))
        month_name = m.group(2).lower()
        year = int(m.group(3))
        month = month_map.get(month_name)
        if month is None:
            return m.group(0)

        return _to_iso_date(day, month, year) or m.group(0)

    # 2) Keyword windows (dated/date: ...)
    for pat in keyword_windows:
        try:
            m = re.search(pat, header, flags=re.IGNORECASE)
        except re.error:
            return None
        if m:
            raw = m.group(1)
            for dp in date_patterns:
                try:
                    dm = re.search(dp, raw)
                except re.error:
                    return None
                if dm:
                    if len(dm.group(1)) == 4:  # yyyy-mm-dd
                        year = int(dm.group(1))
                        month = int(dm.group(2))
                        day = int(dm.group(3))
                        try:
                            return date(year, month, day).isoformat()
                        except Exception:
                            return raw
                    else:  # dd/mm/yyyy
                        day = int(dm.group(1))
                        month = int(dm.group(2))
                        year = int(dm.group(3))
                        return _to_iso_date(day, month, year) or raw
            return raw

    # Otherwise return the first plausible date found.
    for dp in date_patterns:
        try:
            m = re.search(dp, header)
        except re.error:
            return None
        if not m:
            continue

        if len(m.group(1)) == 4:  # yyyy-mm-dd
            year = int(m.group(1))
            month = int(m.group(2))
            day = int(m.group(3))
            try:
                return date(year, month, day).isoformat()
            except Exception:
                return m.group(0)

        day = int(m.group(1))
        month = int(m.group(2))
        year = int(m.group(3))
        return _to_iso_date(day, month, year) or m.group(0)

    return None


def extract_parties(text: str) -> Optional[str]:
    lines = _first_nonempty_lines(text, limit=120)

    # First, try to locate a "X vs Y" / "X v. Y" / "X Versus Y" pattern.
    for ln in lines:
        m = re.search(
            r"(.{2,120}?)\s+\b(vs\.|vs|v\.|v|versus)\b\s+(.{2,120}?)$",
            ln,
            flags=re.IGNORECASE,
        )
        if m:
            left = re.sub(r"\s+", " ", m.group(1)).strip(" .")
            right = re.sub(r"\s+", " ", m.group(3)).strip(" .")
            if left and right:
                return f"{left} vs {right}"

    # Next, try petitioner/respondent style.
    petitioner: Optional[str] = None
    respondent: Optional[str] = None

    for ln in lines:
        if petitioner is None and re.search(r"\bpetitioner\b", ln, re.IGNORECASE):
            petitioner = re.sub(r"\bpetitioner\b.*", "", ln, flags=re.IGNORECASE).strip(" .-")
        if respondent is None and re.search(r"\brespondent\b", ln, re.IGNORECASE):
            respondent = re.sub(r"\brespondent\b.*", "", ln, flags=re.IGNORECASE).strip(" .-")

        if petitioner and respondent:
            break

    if petitioner or respondent:
        p = petitioner or "(Petitioner)"
        r = respondent or "(Respondent)"
        return f"{p} vs {r}"

    return None


def extract_case_fields(text: str, *, enhance_with_spacy: bool = True) -> ExtractedFields:
    """Extract key fields from judgment text using heuristics.

    If available, this can optionally enhance missing fields using spaCy NER.
    """

    if enhance_with_spacy:
        # Primary: spaCy NER (if available)
        try:
            from services.spacy_service import enhance_extracted_fields

            extracted = enhance_extracted_fields(text, ExtractedFields())
        except Exception:
            extracted = ExtractedFields()
    else:
        extracted = ExtractedFields()

    # Fallback: regex/heuristics fill any missing fields.
    if extracted.case_number is None:
        extracted.case_number = extract_case_number(text)
    if extracted.court_name is None:
        extracted.court_name = extract_court_name(text)
    if extracted.order_date is None:
        extracted.order_date = extract_order_date(text)
    if extracted.parties is None:
        extracted.parties = extract_parties(text)

    return extracted


def extract_case_fields_with_meta(text: str) -> tuple[ExtractedFields, dict[str, Any]]:
    """Extract fields and report which extraction engine ran.

    This is primarily used by API endpoints that want to display whether spaCy NER
    was used in addition to regex/heuristics.
    """

    meta: dict[str, Any] = {
        "engine": "regex",
        "spacy_enabled": False,
        "spacy_available": False,
        "spacy_model": None,
        "spacy_ran": False,
        "spacy_updated_fields": [],
        "regex_fallback_fields": [],
    }

    extracted = ExtractedFields()

    try:
        from services.spacy_service import enhance_extracted_fields_with_meta

        enhanced, spacy_meta = enhance_extracted_fields_with_meta(text, extracted)

        meta.update(
            {
                "spacy_enabled": bool(spacy_meta.get("spacy_enabled")),
                "spacy_available": bool(spacy_meta.get("spacy_available")),
                "spacy_model": spacy_meta.get("spacy_model"),
                "spacy_ran": bool(spacy_meta.get("spacy_ran")),
                "spacy_updated_fields": list(spacy_meta.get("updated_fields") or []),
            }
        )

        extracted = enhanced

        if meta["spacy_ran"]:
            meta["engine"] = "spacy"
    except Exception:
        pass

    # Regex/heuristics fallback fills any missing fields.
    regex_fallback_fields: list[str] = []

    if extracted.case_number is None:
        extracted.case_number = extract_case_number(text)
        if extracted.case_number:
            regex_fallback_fields.append("case_number")
    if extracted.court_name is None:
        extracted.court_name = extract_court_name(text)
        if extracted.court_name:
            regex_fallback_fields.append("court_name")
    if extracted.order_date is None:
        extracted.order_date = extract_order_date(text)
        if extracted.order_date:
            regex_fallback_fields.append("order_date")
    if extracted.parties is None:
        extracted.parties = extract_parties(text)
        if extracted.parties:
            regex_fallback_fields.append("parties")

    meta["regex_fallback_fields"] = regex_fallback_fields

    # If spaCy ran and regex also contributed, make that visible.
    if meta.get("engine") == "spacy" and regex_fallback_fields:
        meta["engine"] = "spacy+regex"

    return extracted, meta
