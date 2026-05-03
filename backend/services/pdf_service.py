from __future__ import annotations

import fitz  # PyMuPDF


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """Extract plain text from a PDF byte stream using PyMuPDF."""

    if not pdf_bytes:
        return ""

    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as exc:  # pragma: no cover
        raise ValueError(f"Invalid PDF: {exc}") from exc

    try:
        parts: list[str] = []
        for page in doc:
            parts.append(str(page.get_text("text")))
        return "\n".join(parts).strip()
    finally:
        doc.close()
