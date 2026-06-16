// PantrySnap data-layer proxy (Phase 5).
// Implements the API contract in DATA_LAYER.md. No Gemini here — that's Phase 6.
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { getShelfLife, type Storage } from './sources/shelflife.js';
import { lookupProduct } from './sources/openfoodfacts.js';
import { findRecipes } from './sources/recipes.js';

const app = new Hono();

// PWA (different origin in dev) calls this — allow CORS.
app.use('/api/*', cors());

app.get('/api/health', (c) => c.json({ ok: true, service: 'pantrysnap-data-layer', phase: 5 }));

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

const port = Number(process.env.PORT) || 8787;
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`PantrySnap data layer on http://localhost:${info.port}`);
});

export default app;
