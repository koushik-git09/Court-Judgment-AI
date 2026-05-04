from __future__ import annotations


def normalize_category(category: str | None) -> str:
    return (category or "").strip().lower().replace("&", "and")


def _norm(category: str | None) -> str:
    # Collapse all whitespace to single spaces after normalizing.
    return " ".join(normalize_category(category).split())


def map_category_to_department(category: str | None) -> str:
    """Map a case category to a responsible department.

    This is intentionally conservative and returns a stable default so callers
    can safely store a department even when the category is unknown.
    """

    c = _norm(category)

    mapping: dict[str, str] = {
        "administrative": "Administrative",
        "transport": "Transport",
        "revenue": "Revenue",
        "taxation": "Taxation",
        "education": "Education",
        "health": "Health",
        "infrastructure": "Infrastructure",
        "environment": "Environment",
        "police": "Police",
        "labor": "Labor",
        "public welfare": "Public Welfare",
        "land and property": "Land & Property",
        "utilities": "Utilities",
        # legacy
        "pwd": "Infrastructure",
        "legal": "Administrative",
    }

    # Default: keep stable and within the known set.
    return mapping.get(c, "Administrative")
