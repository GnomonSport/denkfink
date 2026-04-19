# archive

Public, read-only browser for every definition that's been printed by the installation. Each printed card carries a QR code linking to a permanent URL inside this app, so visitors can scan their card and come back later to see their definition + its conversation transcript online.

## Stack

Vanilla TypeScript + Vite. No React, no routing library — just a minimal SPA that queries Supabase directly with the anon key.

## Setup

```bash
cp apps/archive/.env.example apps/archive/.env
# fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY

pnpm --filter @denkfink/archive dev     # http://localhost:5173
pnpm --filter @denkfink/archive build   # dist/ ready to serve behind nginx
```

## Required data

The archive reads from the `definitions` and `turns` tables. Make sure RLS on `turns` allows an anon `SELECT` (it needs this to display conversation transcripts).

## URL shape

`https://archive.YOUR_DOMAIN.com/#/definition/<uuid>` — opens a single definition + its transcript. The `VITE_ARCHIVE_BASE` env var in the tablet app should point to the root of this app so printed QR codes work end-to-end.
