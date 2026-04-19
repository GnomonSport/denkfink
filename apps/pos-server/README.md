# pos-server

Minimal Python HTTP server that accepts rendered card images and streams them to an ESC/POS thermal printer over USB. Runs on the Pi (or any Linux box with the printer attached).

## What it exposes

- `GET /health` → `{"ok": true}` — liveness probe used by the printer bridge.
- `POST /print` — accepts a raster PNG in the request body and prints it. Used by the bridge.
- `POST /print/dictionary` — legacy endpoint the bridge falls back to if the `print-renderer` service is unreachable. Accepts a JSON payload with card fields and renders locally.

Default port: **9100** (LAN-internal).

## Stack

Python 3.11+, `python-escpos`, Pillow, Flask. No external database dependency.

## Setup

```bash
cd apps/pos-server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 print_server.py         # real printer
python3 print_server.py --dummy # stdout-only dry run, no hardware needed
```

## Deployment

Runs as a systemd unit. See [`pos-server.service`](pos-server.service) and the setup guide at [`docs/PI_SETUP.md`](../../docs/PI_SETUP.md).

## Origin

Imported from [github.com/schaferjart/POS-thermal-printer](https://github.com/schaferjart/POS-thermal-printer) as a vendored copy — the monorepo is the source of truth. See [`UPSTREAM.md`](UPSTREAM.md) for sync notes.
