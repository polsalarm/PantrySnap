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

## Status

- [x] `/api/health`
- [x] `/api/shelflife` — USDA FoodKeeper (bundled seed JSON; expand from full export)
- [x] `/api/product` — Open Food Facts
- [x] `/api/recipes` — TheMealDB, expiry-weighted ranking
- [ ] Persistent cache + rate-limit (step 5)
- [ ] Deploy target + env (step 6)
- [ ] Phase 6: `/api/detect`, `/api/recipe/generate`, `/api/chat` (Gemini)
