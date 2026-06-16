# PantrySnap — Data Layer (Phase 5) + API Contract

Backend proxy that grounds the app in real data. **Decoupled from the frontend (Phase 0–4)** —
the two teams meet only at the HTTP contract below. Backend can be built + tested with `curl`
before any UI exists.

- **Runtime:** Hono + TypeScript (portable: Node / Vercel / Cloudflare / Bun — host decided later).
- **Location:** `server/` (own package; does not touch the root Vite app).
- **Secrets:** all API keys live here, never in the PWA client.

---

## Data sources

| Need | Source | Method | Key? |
|------|--------|--------|------|
| Product info (name → category) | **Open Food Facts** | REST | no |
| Shelf-life / storage | **USDA FoodKeeper** | bundled static JSON (`src/data/foodkeeper.json`) | no |
| Recipes by ingredient | **TheMealDB** (free) → Spoonacular (later, richer) | REST | TheMealDB no / Spoonacular yes |
| Fresh web facts (Phase 6 chat) | Gemini Google Search grounding | — | Gemini |

**Scraping policy:** APIs first. Only scrape if no API exists; then parse **JSON-LD**
(`schema.org/Recipe`) via `fetch` + cheerio — never brittle DOM selectors, never a headless
browser on serverless. Respect robots.txt + ToS, rate-limit, cache hard.

---

## API contract (frontend ⇄ backend)

Base: `/api`. All JSON. Frontend calls these; backend decides API-vs-bundled-vs-scrape behind them.

### `GET /api/product?name=<q>`
Look up a product, get its category + default shelf life.
```json
{ "name": "Whole Milk", "category": "dairy",
  "matched": true, "source": "openfoodfacts" }
```

### `GET /api/shelflife?category=<cat>&storage=<fridge|freezer|pantry>`
Shelf-life estimate for the expiry estimator (`purchaseDate + days`).
```json
{ "category": "dairy", "storage": "fridge", "days": 7, "source": "foodkeeper" }
```

### `GET /api/recipes?have=<csv>&expiring=<csv>&limit=<n>`
Recipes ranked by on-hand match; `expiring` items weighted higher (cook-to-beat-expiry).
```json
{ "recipes": [
  { "id": "52772", "title": "Teriyaki Chicken", "image": "...",
    "matchCount": 6, "totalCount": 8,
    "usesExpiring": ["chicken","spring onion"],
    "ingredients": ["..."], "steps": ["..."], "source": "themealdb" }
] }
```

### `GET /api/health`
`{ "ok": true }`

> **Phase 6 adds:** `POST /api/detect` (photo → items, Gemini vision),
> `POST /api/recipe/generate` (Gemini, grounded by `/api/recipes`),
> `POST /api/chat` (Gemini + grounding). Same proxy.

---

## Internal models (align with `PLAN.md`)

`category` + `storage` values must match what the frontend stores on `Item`
(`Item.category`, shelf/storage). Agree on the enum lists before integration.

Storage enum: `fridge | freezer | pantry`.

---

## Build order (Phase 5)

1. Scaffold `server/` (Hono + TS) + `/api/health`. ✅ first
2. FoodKeeper dataset → `/api/shelflife`.
3. Open Food Facts → `/api/product`.
4. TheMealDB → `/api/recipes` (with expiry weighting).
5. Caching layer + rate-limit.
6. Deploy target decision (Vercel / Cloudflare) + wire env.
