# print-renderer

FastAPI service that turns structured card data into a raster PNG ready for thermal printing. Handles dictionary-style definition cards, portrait cards, halftone / Floyd-Steinberg dithering, slice composition, and optional OpenRouter-backed style transfer for portraits.

## Endpoints

| Method | Path                         | Purpose                                                       |
| ------ | ---------------------------- | ------------------------------------------------------------- |
| POST   | `/render/dictionary`         | Render a definition card from `{term, definition_text, ...}`. |
| POST   | `/render/slice`              | Slice an uploaded image into N strips, optionally dither.     |
| POST   | `/render/dither`             | Dither a single uploaded image.                               |
| POST   | `/render/portrait`           | Portrait pipeline: crop → style-transfer → dither.            |
| GET    | `/health`                    | Liveness probe.                                               |

Auth: clients send `X-Api-Key` matching `RENDER_API_KEY`. Used by both the tablet (for live previews in the workbench) and the printer bridge (for production rendering).

## Stack

Python 3.11+, FastAPI, Uvicorn, Pillow, `supabase-py`, optional `httpx` for OpenRouter. Config lives in [`config.yaml`](config.yaml), with overrides read from the Supabase `render_config` table (takes priority).

## Setup

```bash
cd apps/print-renderer
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RENDER_API_KEY,
#         OPENROUTER_API_KEY, and optionally ARCHIVE_BASE_URL / N8N_WEBHOOK_URL

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Config layering

1. Look up the active template + its params in `render_config` (Supabase) — written by the config app.
2. Fall back to `config.yaml` keys that aren't in the table yet.
3. Defaults baked into the Python code.

When adding a new card template: (1) add a JSONB column to `render_config`, (2) map it in `supabase_config.py` `_row_to_config()`, (3) add a YAML fallback section so bootstrap still works if the table row is missing.

## Async gotcha

Long-running PIL / MediaPipe calls block the uvicorn event loop. Endpoints that do image work are declared `def` (sync) so FastAPI runs them in a threadpool. If you rewrite one as `async def` with blocking calls inside, workers will stall under load.
