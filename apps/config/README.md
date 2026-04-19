# config

Operator / admin UI. Lets you edit the installation's runtime configuration (which mode the tablet runs, which text the AI references, system prompts, card templates), and exposes a "workbench" with standalone tools for experimenting with card layouts before committing them to production.

Auth: Supabase email/password. Only authenticated users can write — anon users get 401 on mutations thanks to RLS.

## Stack

Vanilla TypeScript + Vite. No React. Heavy use of the `createSlider` / `createToggle` / `createRadioGroup` helpers in [`src/lib/forms.ts`](src/lib/forms.ts) to build the UI.

## Setup

```bash
cp apps/archive/.env.example apps/config/.env   # same schema: VITE_SUPABASE_URL + ANON_KEY
pnpm --filter @denkfink/config dev     # http://localhost:5173
pnpm --filter @denkfink/config build   # dist/ ready to serve behind nginx
```

## Tabs

- **Programs** — pipeline view: each of the three installation modes is a sequence of configurable blocks (text, term prompt, conversation, portrait, print). Edit per-block config here.
- **Workbench** — standalone tools:
  - **Print card** — render + preview + send to printer.
  - **Dither** — upload an image, try dither modes + contrast / brightness / sharpness / blur, preview.
  - **Slice** — slice an image horizontally or vertically into N strips, dither each, send to printer as separate cuts *or* as one single print with a configurable gap. Optional padding + caption block (filename, settings, date). Saves caption preferences to localStorage.
  - **Portrait** — upload a photo, tune crop and style transfer, preview.
  - **Raster painter** — full raster simulation canvas for experimenting with print textures.
  - **Texts** — CRUD on the `texts` table (what the tablet reads out to visitors).
  - **Definitions** — browse, filter, export all past definitions.
  - **Prompts** — edit system prompts live.

## Portrait crop tuner

Standalone HTML page at [`public/portrait-tuner.html`](public/portrait-tuner.html) — browser-side MediaPipe face detection. No backend needed for crop calibration; useful for tuning `pad_top`, `pad_bottom`, `center_x`, and per-zoom `zoom_N_width` / `zoom_N_offset` parameters before saving them to `render_config`.
