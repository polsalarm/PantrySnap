// PantrySnap proxy. Phase 5 data layer + Phase 6 AI (Gemini).
// Implements the API contract in DATA_LAYER.md.
import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { getShelfLife, type Storage } from './sources/shelflife.js';
import { lookupProduct } from './sources/openfoodfacts.js';
import { findRecipes } from './sources/recipes.js';
import { aiEnabled, aiMode } from './lib/gemini.js';
import { detectItems, generateRecipe, chat, type ChatMessage } from './sources/ai.js';

const app = new Hono();

// PWA (different origin in dev) calls this — allow CORS.
app.use('/api/*', cors());

app.get('/api/health', (c) =>
  c.json({ ok: true, service: 'pantrysnap', phase: 6, aiEnabled, aiMode }),
);

// GET /api/product?name=milk
app.get('/api/product', async (c) => {
  const name = c.req.query('name')?.trim();
  if (!name) return c.json({ error: 'name query param required' }, 400);
  return c.json(await lookupProduct(name));
});

// GET /api/shelflife?category=dairy&storage=fridge
app.get('/api/shelflife', (c) => {
  const category = c.req.query('category')?.trim();
  const storage = (c.req.query('storage')?.trim() || 'fridge') as Storage;
  if (!category) return c.json({ error: 'category query param required' }, 400);
  if (!['fridge', 'freezer', 'pantry'].includes(storage)) {
    return c.json({ error: 'storage must be fridge|freezer|pantry' }, 400);
  }
  return c.json(getShelfLife(category, storage));
});

// GET /api/recipes?have=egg,milk&expiring=spinach&limit=5
app.get('/api/recipes', async (c) => {
  const have = (c.req.query('have') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const expiring = (c.req.query('expiring') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const limit = Math.min(Math.max(Number(c.req.query('limit')) || 10, 1), 25);
  if (have.length === 0) return c.json({ error: 'have query param required (csv)' }, 400);
  return c.json({ recipes: await findRecipes(have, expiring, limit) });
});

// ---- Phase 6: AI (Gemini). Key-gated — 503 when GEMINI_API_KEY is unset. ----

const requireAI = (c: import('hono').Context) =>
  aiEnabled ? null : c.json({ error: 'AI disabled: set GEMINI_API_KEY in server/.env' }, 503);

// POST /api/detect  { imageBase64, mimeType }  -> [{name, category, quantityPct}]
app.post('/api/detect', async (c) => {
  const gate = requireAI(c);
  if (gate) return gate;
  const body = await c.req.json().catch(() => null);
  const imageBase64 = body?.imageBase64 as string | undefined;
  const mimeType = (body?.mimeType as string | undefined) ?? 'image/jpeg';
  if (!imageBase64) return c.json({ error: 'imageBase64 required' }, 400);
  try {
    return c.json({ items: await detectItems(imageBase64, mimeType) });
  } catch (e) {
    return c.json({ error: 'detect failed', detail: String(e) }, 502);
  }
});

// POST /api/recipe/generate  { have[], expiring[] }  -> generated recipe
app.post('/api/recipe/generate', async (c) => {
  const gate = requireAI(c);
  if (gate) return gate;
  const body = await c.req.json().catch(() => null);
  const have = Array.isArray(body?.have) ? (body.have as string[]) : [];
  const expiring = Array.isArray(body?.expiring) ? (body.expiring as string[]) : [];
  if (have.length === 0) return c.json({ error: 'have[] required' }, 400);
  try {
    return c.json(await generateRecipe(have, expiring));
  } catch (e) {
    return c.json({ error: 'generate failed', detail: String(e) }, 502);
  }
});

// POST /api/chat  { messages[], pantry[] }  -> { reply }
app.post('/api/chat', async (c) => {
  const gate = requireAI(c);
  if (gate) return gate;
  const body = await c.req.json().catch(() => null);
  const messages = Array.isArray(body?.messages) ? (body.messages as ChatMessage[]) : [];
  const pantry = Array.isArray(body?.pantry) ? body.pantry : [];
  if (messages.length === 0) return c.json({ error: 'messages[] required' }, 400);
  try {
    return c.json({ reply: await chat(messages, pantry) });
  } catch (e) {
    return c.json({ error: 'chat failed', detail: String(e) }, 502);
  }
});

const port = Number(process.env.PORT) || 8787;
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`PantrySnap data layer on http://localhost:${info.port}`);
});

export default app;
