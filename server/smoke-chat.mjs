// Smoke test for /api/chat against a running server (npm run dev).
//   node smoke-chat.mjs [baseUrl]
// Catches the things that break silently: bad key/model, and the 'model' ->
// 'assistant' role mapping (OpenAI-compatible APIs 400 on role 'model').
import assert from 'node:assert/strict';

const base = process.argv[2] ?? 'http://localhost:8787';

const health = await fetch(`${base}/api/health`).then((r) => r.json());
assert.equal(health.ok, true, 'server not healthy');
assert.notEqual(health.chatProvider, 'off', 'no chat provider configured');
console.log(`chatProvider: ${health.chatProvider}`);

// Multi-turn: the 'model' turn must survive the role mapping, and pantry
// context must reach the system prompt.
const res = await fetch(`${base}/api/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', text: 'hi' },
      { role: 'model', text: 'Hello! What is in your kitchen?' },
      { role: 'user', text: 'Name the one item in my pantry. Reply with only that word.' },
    ],
    pantry: [{ name: 'spinach', expiryDate: '2026-08-29', quantityPct: 60 }],
  }),
});

const body = await res.text(); // read once — assert messages must not re-consume it
assert.equal(res.status, 200, `chat -> ${res.status} ${body}`);
const { reply } = JSON.parse(body);
assert.ok(reply?.length > 0, 'empty reply');
assert.match(reply, /spinach/i, `pantry context missing from reply: ${reply}`);

console.log('ok — chat smoke passed');
