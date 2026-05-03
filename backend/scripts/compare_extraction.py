from __future__ import annotations

import json
import sys
from pathlib import Path

# Ensure imports like `from services...` work when executing from `backend/scripts/`.
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from services.extraction_service import extract_case_fields
from services.pdf_service import extract_text_from_pdf_bytes


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python scripts/compare_extraction.py <path-to-pdf>")
        return 2

    pdf_path = Path(sys.argv[1]).expanduser()
    if not pdf_path.exists() or not pdf_path.is_file():
        print(f"File not found: {pdf_path}")
        return 2

    pdf_bytes = pdf_path.read_bytes()
    text = extract_text_from_pdf_bytes(pdf_bytes)

    heuristic = extract_case_fields(text, enhance_with_spacy=False)
    enhanced = extract_case_fields(text, enhance_with_spacy=True)

    payload = {
        "file": str(pdf_path),
        "text_chars": len(text),
        "heuristic": heuristic.model_dump() if hasattr(heuristic, "model_dump") else heuristic.dict(),
        "spacy_enhanced": enhanced.model_dump() if hasattr(enhanced, "model_dump") else enhanced.dict(),
    }

    print(json.dumps(payload, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
