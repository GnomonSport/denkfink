# printer-bridge

Tiny Node service that bridges Supabase Realtime to the local ESC/POS printer. Subscribes to new `pending` rows in the `print_queue` table, fetches the rendered PNG from Supabase Storage (or the `print-renderer` service), and POSTs to [`pos-server`](../pos-server/).

Runs next to the thermal printer — usually on the same Pi as `pos-server`. **Not** a cloud service.

## Stack

Node 20, TypeScript (run via `tsx`, no build step). `@supabase/supabase-js` for Realtime. Depends on [`@denkfink/shared`](../../packages/shared/) for Supabase types.

## Setup

```bash
cp apps/printer-bridge/.env.example apps/printer-bridge/.env
# fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, POS_SERVER_URL,
#         PRINT_RENDERER_URL, RENDER_API_KEY

pnpm --filter @denkfink/printer-bridge dev
```

Smoke test by inserting a row into `print_queue` via the Supabase SQL editor and watching the bridge pick it up + print.

## Payload shapes

The bridge handles two `payload` types on `print_queue.payload`:

1. **Dictionary** — `{ term, definition_text, citations, language, session_number, chain_ref, timestamp, template }`. The bridge calls `print-renderer` to rasterise, gets a PNG back, sends to POS.
2. **Portrait** — `{ type: 'portrait', image_urls: [{ name, url }], job_id, timestamp }`. The bridge downloads each URL and sends to POS directly. Used by the workbench's slice / portrait flows.

## Deployment

Runs as a systemd unit. See [`printer-bridge.service`](printer-bridge.service) and the full Pi walkthrough at [`docs/PI_SETUP.md`](../../docs/PI_SETUP.md).

## Pi / RAM notes

Pi 5 RAM is tight enough that `pnpm install` across the whole monorepo can OOM-kill. On the Pi, install only what this bridge needs:

```bash
pnpm install --filter @denkfink/printer-bridge... --ignore-scripts
```

`packages/shared/dist/` is committed so the Pi never has to build TypeScript.
