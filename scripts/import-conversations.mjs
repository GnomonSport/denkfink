// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-conversations.mjs
// Consumes scripts/output/conversations-export.json produced by extract-conversations.ts.
import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL) throw new Error('Set SUPABASE_URL');
if (!KEY) throw new Error('Set SUPABASE_SERVICE_ROLE_KEY');

const URL = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1`;
const HEADERS = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };

const data = JSON.parse(readFileSync('scripts/output/conversations-export.json', 'utf8'));
let sessions = 0, defs = 0, turns = 0;

for (const conv of data) {
  if (!conv.matched_definition) continue;
  const sid = randomUUID();

  // Insert session
  let r = await fetch(`${URL}/sessions`, { method: 'POST', headers: HEADERS, body: JSON.stringify({ id: sid, elevenlabs_conversation_id: conv.conversation_id, created_at: conv.started_at_utc, mode: 'text_term', term: conv.matched_definition.term, context_text: 'imported' }) });
  if (!r.ok) { console.error('S:', r.status, await r.text()); continue; }
  sessions++;

  // Link definition
  r = await fetch(`${URL}/definitions?id=eq.${conv.matched_definition.id}&session_id=is.null`, { method: 'PATCH', headers: HEADERS, body: JSON.stringify({ session_id: sid }) });
  if (r.ok) defs++;

  // Insert turns
  const rows = conv.transcript.filter(t => t.message && t.message.trim()).map((t, i) => ({
    session_id: sid, turn_number: i + 1,
    role: t.role === 'user' ? 'visitor' : 'agent',
    content: t.message, language: conv.matched_definition.language || 'en',
    created_at: conv.started_at_utc
  }));

  if (rows.length) {
    r = await fetch(`${URL}/turns`, { method: 'POST', headers: HEADERS, body: JSON.stringify(rows) });
    if (!r.ok) console.error('T:', r.status, await r.text());
    else turns += rows.length;
  }
}

console.log(`${sessions} sessions, ${defs} defs linked, ${turns} turns imported`);
