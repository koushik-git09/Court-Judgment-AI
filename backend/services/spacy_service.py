from __future__ import annotations

import os
import re
from dataclasses import dataclass
from datetime import date
from functools import lru_cache
from typing import Any, Iterable, Optional

from services.extraction_service import ExtractedFields


@dataclass(frozen=True)
class _Entity:
    text: str
    label: str
    start_char: int


def _to_iso_date(day: int, month: int, year: int) -> Optional[str]:
    try:
        return date(year, month, day).isoformat()
    except Exception:
        return None


def _parse_date_candidate(candidate: str) -> Optional[str]:
    """Parse a free-form date string into ISO date if possible."""

    s = re.sub(r"\s+", " ", candidate).strip()
    if not s:
        return None

    # Numeric formats.
    for pat in [
        r"\b(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})\b",  # dd/mm/yyyy
        r"\b(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})\b",  # yyyy-mm-dd
    ]:
        m = re.search(pat, s)
        if not m:
            continue

        if len(m.group(1)) == 4:
            year = int(m.group(1))
            month = int(m.group(2))
            day = int(m.group(3))
            try:
                return date(year, month, day).isoformat()
            except Exception:
                return None

        day = int(m.group(1))
        month = int(m.group(2))
        year = int(m.group(3))
        return _to_iso_date(day, month, year)

    # Month-name formats.
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

    months = "January|February|March|April|May|June|July|August|September|October|November|December"
    for pat in [
        rf"\b(\d{{1,2}})(?:st|nd|rd|th)?\s+({months})\s*,?\s*(\d{{4}})\b",
        rf"\b(\d{{1,2}})(?:st|nd|rd|th)?\s+day\s+of\s+({months})\s+(\d{{4}})\b",
        rf"\bdated\s+this\s+the\s+(\d{{1,2}})(?:st|nd|rd|th)?\s+day\s+of\s+({months})\s+(\d{{4}})\b",
    ]:
        m = re.search(pat, s, flags=re.IGNORECASE)
        if not m:
            continue

        day = int(m.group(1))
        month = month_map.get(m.group(2).lower())
        year = int(m.group(3))
        if month is None:
            return None
        return _to_iso_date(day, month, year)

    return None


@lru_cache(maxsize=4)
def _get_nlp_cached(model: str):
    """Cache only *successful* model loads."""

    import spacy  # type: ignore

    # Keep only what we need for NER; this makes inference cheaper.
    disable = [
        "parser",
        "tagger",
        "lemmatizer",
        "attribute_ruler",
        "textcat",
        "textcat_multilabel",
        "senter",
    ]

    return spacy.load(model, disable=disable)


def _get_nlp():
    """Return a spaCy nlp pipeline if available; otherwise None.

    Lazy-loads the model. Failed loads are not cached, so if you install the
    model later, subsequent requests can start using it.
    """

    enabled = os.getenv("SPACY_ENABLED", "true").strip().lower() not in {"0", "false", "no"}
    if not enabled:
        return None

    try:
        import spacy  # noqa: F401  # type: ignore
    except Exception:
        return None

    model = os.getenv("SPACY_MODEL", "en_core_web_sm").strip() or "en_core_web_sm"

    try:
        return _get_nlp_cached(model)
    except Exception:
        return None


def _iter_entities(text: str, *, max_chars: int = 20_000) -> list[_Entity]:
    nlp = _get_nlp()
    if nlp is None:
        return []

    chunk = text[:max_chars]
    try:
        doc = nlp(chunk)
    except Exception:
        return []

    ents: list[_Entity] = []
    for ent in doc.ents:
        ent_text = ent.text.strip()
        if not ent_text:
            continue
        ents.append(_Entity(text=ent_text, label=ent.label_, start_char=int(ent.start_char)))

    return ents


def _pick_first(items: Iterable[str]) -> Optional[str]:
    for it in items:
        s = it.strip()
        if s:
            return s
    return None


def _spacy_order_date_from_ents(text: str, ents: list[_Entity]) -> Optional[str]:
    # Keep DATE entities in document order.
    candidates = [e.text for e in ents if e.label == "DATE"]
    for cand in candidates:
        parsed = _parse_date_candidate(cand)
        if parsed:
            return parsed

    # Some documents include dates tagged as ORG/OTHER; fallback: scan first lines for patterns.
    fallback = _parse_date_candidate(text[:4000])
    return fallback


def _spacy_court_name_from_ents(ents: list[_Entity]) -> Optional[str]:
    for e in ents:
        if "court" in e.text.lower() and e.label in {"ORG", "GPE", "FAC"}:
            return e.text.strip()
    return None


def _spacy_parties_from_ents(ents: list[_Entity]) -> Optional[str]:
    # Take the first two distinct ORG/PERSON entities that do NOT look like courts/judges.
    bad_words = {"court", "judge", "justice", "bench"}
    picked: list[str] = []
    seen: set[str] = set()

    for e in ents:
        if e.label not in {"ORG", "PERSON"}:
            continue

        key = re.sub(r"\s+", " ", e.text).strip().lower()
        if not key or key in seen:
            continue

        if any(w in key for w in bad_words):
            continue

        seen.add(key)
        picked.append(e.text.strip())
        if len(picked) >= 2:
            break

    if len(picked) >= 2:
        return f"{picked[0]} vs {picked[1]}"

    return None


def enhance_extracted_fields_with_meta(text: str, extracted: ExtractedFields) -> tuple[ExtractedFields, dict[str, Any]]:
    """Enhance extracted fields using spaCy NER when available and return metadata.

    Metadata keys:
      - spacy_enabled: bool
      - spacy_available: bool  (spaCy + model load ok)
      - spacy_model: str
      - spacy_ran: bool        (NER attempted)
      - updated_fields: list[str]
    """

    enabled = os.getenv("SPACY_ENABLED", "true").strip().lower() not in {"0", "false", "no"}
    model = os.getenv("SPACY_MODEL", "en_core_web_sm").strip() or "en_core_web_sm"

    nlp = _get_nlp()
    available = nlp is not None

    meta: dict[str, Any] = {
        "spacy_enabled": enabled,
        "spacy_available": available,
        "spacy_model": model,
        "spacy_ran": False,
        "updated_fields": [],
    }

    if not available:
        return extracted, meta

    ents = _iter_entities(text)
    meta["spacy_ran"] = True

    update: dict[str, Optional[str]] = {}
    if extracted.order_date is None:
        update["order_date"] = _spacy_order_date_from_ents(text, ents)
    if extracted.court_name is None:
        update["court_name"] = _spacy_court_name_from_ents(ents)
    if extracted.parties is None:
        update["parties"] = _spacy_parties_from_ents(ents)

    update = {k: v for k, v in update.items() if v}
    meta["updated_fields"] = sorted(update.keys())
    if not update:
        return extracted, meta

    if hasattr(extracted, "model_copy"):
        return extracted.model_copy(update=update), meta  # type: ignore[attr-defined]

    return extracted.copy(update=update), meta


def enhance_extracted_fields(text: str, extracted: ExtractedFields) -> ExtractedFields:
    """Fill missing extracted fields using spaCy NER when available.

    This never overwrites non-empty values from the heuristic extractor.
    """

    enhanced, _meta = enhance_extracted_fields_with_meta(text, extracted)
    return enhanced
