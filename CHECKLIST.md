# PantrySnap — Outstanding Checklist

What's still missing / needed to add. Living doc. ✅ done · ⬜ todo · 🔑 needs a key/account.

> Status: **P0–P5 done end-to-end.** Next big block = **P6 AI**. Most gaps below are P6 + infra.

---

## 🔑 API keys / accounts to get

| Key / account | For | Phase | Where it goes | Required? |
|---------------|-----|-------|---------------|-----------|
| ⬜ 🔑 `GEMINI_API_KEY` | All AI (detect, recipe gen, tips, chat) | P6 | `server/.env` | **Yes** for AI |
| ⬜ 🔑 `SPOONACULAR_API_KEY` | Richer recipes (optional upgrade over TheMealDB) | P5+ | `server/.env` | No (TheMealDB free works) |
| ✅ Open Food Facts | Product lookup | P5 | none (keyless) | — |
| ✅ TheMealDB (free tier) | Recipes | P5 | none (keyless) | — |
| ✅ USDA FoodKeeper | Shelf-life | P5 | bundled JSON | — |
| ⬜ Deploy host account | Host the `server/` proxy | infra | Vercel / Cloudflare | Yes to ship |

---

## ⬜ P5 — Data layer (remaining)

- ⬜ Expand `server/src/data/foodkeeper.json` from the **full USDA FoodKeeper export** (current = seed subset).
- ⬜ Align category enums: frontend `CATEGORIES` (`src/lib/expiry.ts`) vs backend FoodKeeper keys — some map to `default` (e.g. `produce`, `seafood`, `pantry`). Add aliases.
- ⬜ Persistent cache + rate-limit (swap in-memory `cache.ts` for KV/Redis at deploy).
- ⬜ Barcode lookup endpoint (Open Food Facts supports barcode) — backlog feature.

---

## 🟡 P6 — AI features (Gemini) — BACKEND DONE, frontend pending

Backend endpoints built in `server/` (key-gated → 503 until `GEMINI_API_KEY` set):

- ✅ `POST /api/detect` — photo → `{name, category, quantityPct}[]` (`gemini-2.5-flash` vision, JSON schema).
- ✅ `POST /api/recipe/generate` — on-hand + near-expiry → full recipe (`gemini-2.5-pro`), grounded by `/api/recipes` seed.
- ✅ `POST /api/chat` — conversational over pantry data (`gemini-2.5-flash`) + Google Search grounding.
- ✅ `/api/health` reports `aiEnabled`.
- ⬜ Live test against real Gemini key (needs `GEMINI_API_KEY` in `server/.env`).
- ⬜ Smart tips as a dedicated endpoint (currently folded into chat).

Frontend wiring for P6 (not started):
- ⬜ Add-item **scan** flow: call `/api/detect`, pre-fill `ItemForm` from the result.
- ⬜ **Chat** page/tab (design exists: `design/screens/06-chat-assistant.png`) — not built in frontend yet.
- ⬜ "Generate recipe" button on Recipes page → `/api/recipe/generate`.
- ⬜ Loading + error + offline states for all AI calls.

---

## ⬜ Frontend gaps (current)

- ⬜ **Chat tab** — nav has it in design, confirm route/page exists; AI not wired.
- ⬜ "Cook this now" button on Alerts → deep-link to a matching recipe (P4.5 link).
- ⬜ Empty/loading/error states pass (P7 polish).
- ⬜ Confirm camera capture works on a real mobile device (not just `<input capture>` desktop).

---

## ⬜ Infra / deploy

- ⬜ Decide host: **Vercel Functions** vs **Cloudflare Workers** (Hono runs on both).
- ⬜ Deploy `server/` proxy; set `VITE_API_BASE` to its URL for the built PWA.
- ⬜ Deploy PWA (static) — Vercel/Netlify/Cloudflare Pages.
- ⬜ CORS allowlist to the PWA origin (currently open `*`).
- ⬜ Rate-limit + basic abuse protection on AI endpoints (cost control).
- ⬜ Secrets in host env (never commit `.env`).

---

## ⬜ Quality / housekeeping

- ⬜ Tests: backend endpoints (shelflife/product/recipes), expiry estimator.
- ⬜ README: fix duplicated sentence in AI Architecture section (merge artifact).
- ⬜ CI: typecheck + build on PR.
- ⬜ Lighthouse PWA audit (P7).
- ⬜ Error logging/monitoring on the proxy.

---

## ⬜ P7 / P8 (later)

- ⬜ P7 polish: onboarding, search/filter, animations, a11y, Lighthouse pass.
- ⬜ P8 cloud: Supabase/Firebase auth + multi-device sync + conflict handling.

---

### Immediate next (recommended order)
1. Get `GEMINI_API_KEY`.
2. Build P6 endpoints (key-gated) + wire scan/chat/generate in frontend.
3. Pick deploy host, ship proxy + PWA.
4. Expand FoodKeeper data + align category enums.
