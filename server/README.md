# PantrySnap — Data Layer Server (Phase 5)

Standalone backend proxy. Grounds the app in real data (Open Food Facts, USDA FoodKeeper,
TheMealDB). Decoupled from the frontend — built + tested independently. Holds all keys.

See **[../DATA_LAYER.md](../DATA_LAYER.md)** for the full API contract.

## Run

```bash
cd server
npm install
cp .env.example .env   # optional; defaults work with no keys
npm run dev            # http://localhost:8787
```

## Endpoints

```bash
curl "http://localhost:8787/api/health"
curl "http://localhost:8787/api/shelflife?category=dairy&storage=fridge"
curl "http://localhost:8787/api/product?name=whole%20milk"
curl "http://localhost:8787/api/recipes?have=chicken,onion,garlic&expiring=chicken&limit=5"
```

## Stack

- **Hono** + TypeScript (portable: Node / Vercel / Cloudflare / Bun)
- In-memory TTL cache (`src/lib/cache.ts`) — swap for KV/Redis at deploy time
- No external keys required for the MVP sources (Spoonacular/Gemini optional, later)

## AI (Phase 6)

Set `GEMINI_API_KEY` in `.env` to enable. Without it, AI routes return 503 and the
data layer keeps working. Models: `gemini-2.5-flash` (detect/chat), `gemini-2.5-pro` (recipe gen).

```bash
# POST /api/detect          { imageBase64, mimeType }      -> { items: [{name,category,quantityPct}] }
# POST /api/recipe/generate { have:[], expiring:[] }        -> { title, ingredients, steps, usesExpiring, basedOn }
# POST /api/chat            { messages:[{role,text}], pantry:[] } -> { reply }
curl "http://localhost:8787/api/health"   # { ..., aiEnabled: true|false }
```

## Status

- [x] `/api/health` (reports `aiEnabled`)
- [x] `/api/shelflife` — USDA FoodKeeper (bundled seed JSON; expand from full export)
- [x] `/api/product` — Open Food Facts
- [x] `/api/recipes` — TheMealDB, expiry-weighted ranking
- [x] Phase 6: `/api/detect`, `/api/recipe/generate`, `/api/chat` (Gemini, key-gated)
- [ ] Live Gemini test (needs key)
- [ ] Persistent cache + rate-limit
- [ ] Deploy target + env
