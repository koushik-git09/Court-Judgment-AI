# Government Web App UI Design

This is a code bundle for Government Web App UI Design. The original project is available at https://www.figma.com/design/G1ZHEmlA7uDratHoVFTAAG/Government-Web-App-UI-Design.

## Running the code

This repo’s Vite/React app lives in `frontend/`.

Install dependencies:

- `npm --prefix frontend install`

Start the dev server:

- `npm --prefix frontend run dev`

Or from the repo root:

- `npm run install:frontend`
- `npm run dev`

## Backend (FastAPI)

The API lives in `backend/`.

Create + activate a venv, then install deps:

- `python -m venv backend/venv`
- `backend/venv/Scripts/activate`
- `pip install -r backend/requirements.txt`

Run the server:

- `uvicorn main:app --reload` (from the `backend/` folder)

### Optional: enable spaCy NER for better extraction

The backend can optionally use spaCy Named Entity Recognition to improve extraction (dates/parties/court). This is a safe fallback: if the model isn't installed, it automatically uses the existing regex/heuristics.

Install a language model (one-time):

- `python -m spacy download en_core_web_sm`

You can control it via env vars:

- `SPACY_ENABLED=true|false`
- `SPACY_MODEL=en_core_web_sm` (default)
