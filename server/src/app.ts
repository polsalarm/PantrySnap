// PantrySnap proxy app (Hono). Phase 5 data layer + Phase 6 AI (Gemini).
// Exported without a listener so it runs both locally (index.ts) and as a
// Vercel serverless function (api/index.ts). See DATA_LAYER.md for the contract.
import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getShelfLife, type Storage } from './sources/shelflife.js';
import { lookupProduct } from './sources/openfoodfacts.js';
import { findRecipes } from './sources/recipes.js';
import { aiEnabled, aiMode } from './lib/gemini.js';
import { detectItems, generateRecipe, chat, type ChatMessage } from './sources/ai.js';
import { analyzeExpiry, type ExpiryRequest } from './sources/expiry.js';
import { verifyToken, bearer, authRequired } from './lib/auth.js';
import { checkRate } from './lib/ratelimit.js';

const app = new Hono();

// CORS: lock to the PWA origin(s) in prod via CORS_ORIGIN (comma-separated).
// Defaults to '*' for local dev when unset.
const origins = (process.env.CORS_ORIGIN ?? '*').split(',').map((s) => s.trim());
app.use(
  '/api/*',
  cors({ origin: origins.length === 1 && origins[0] === '*' ? '*' : origins }),
);

app.get('/api/health', (c) =>
  c.json({ ok: true, service: 'pantrysnap', phase: 6, aiEnabled, aiMode, authRequired }),
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

// POST /api/expiry/analyze  -> deterministic expiry estimate (+ optional AI reasoning).
// Public: numbers are rule-based, so it works without auth/AI; AI is best-effort inside.
app.post('/api/expiry/analyze', async (c) => {
  const body = (await c.req.json().catch(() => null)) as ExpiryRequest | null;
  if (!body?.category || !body?.purchaseDate) {
    return c.json({ error: 'category and purchaseDate required' }, 400);
  }
  if (body.storage && !['fridge', 'freezer', 'pantry'].includes(body.storage)) {
    return c.json({ error: 'storage must be fridge|freezer|pantry' }, 400);
  }
  try {
    return c.json(await analyzeExpiry(body));
  } catch (e) {
    return c.json({ error: 'analyze failed', detail: String(e) }, 502);
  }
});

// ---- Phase 6: AI (Gemini). Open to guests; Gemini must be configured. ----
const aiGate = async (c: import('hono').Context, next: import('hono').Next) => {
  if (!aiEnabled) return c.json({ error: 'AI disabled: configure Gemini/Vertex on the server' }, 503);
  const user = await verifyToken(bearer(c.req.header('Authorization')));
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim();
  const rate = checkRate(user.id === 'anonymous' ? `anon:${ip || 'local'}` : user.id);
  if (!rate.ok) {
    c.header('Retry-After', String(rate.retryAfterSec));
    return c.json({ error: `Rate limit reached — try again in ${rate.retryAfterSec}s` }, 429);
  }
  c.header('X-RateLimit-Remaining', String(rate.remaining));
  await next();
};

app.use('/api/detect', aiGate);
app.use('/api/recipe/generate', aiGate);
app.use('/api/chat', aiGate);

// POST /api/detect
//   { images: [{ imageBase64, mimeType }] }  (multi-angle, more accurate), or
//   { imageBase64, mimeType }                (legacy single)
//   -> { items: [{name, category, quantityPct, ...}] }
app.post('/api/detect', async (c) => {
  const body = await c.req.json().catch(() => null);
  const list = Array.isArray(body?.images)
    ? (body.images as { imageBase64?: string; mimeType?: string }[])
    : body?.imageBase64
      ? [{ imageBase64: body.imageBase64 as string, mimeType: body.mimeType as string }]
      : [];
  const images = list
    .filter((im) => im?.imageBase64)
    .slice(0, 4)
    .map((im) => ({ imageBase64: im.imageBase64!, mimeType: im.mimeType ?? 'image/jpeg' }));
  if (images.length === 0) return c.json({ error: 'imageBase64 or images[] required' }, 400);
  try {
    return c.json({ items: await detectItems(images) });
  } catch (e) {
    return c.json({ error: 'detect failed', detail: String(e) }, 502);
  }
});

// POST /api/recipe/generate  { have[], expiring[] }  -> generated recipe
app.post('/api/recipe/generate', async (c) => {
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

export default app;
