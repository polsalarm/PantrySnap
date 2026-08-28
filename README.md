<p align="center">
  <img src="public/steve.png" alt="Steve, the PantrySnap mascot" width="168" />
</p>

<p align="center">
  <img src="public/icons/icon-192.png" alt="PantrySnap app icon" width="88" />
  &nbsp;
  <img src="public/apple-touch-icon.png" alt="PantrySnap Apple touch icon" width="88" />
  &nbsp;
  <img src="public/favicon.svg" alt="PantrySnap mark" width="88" />
</p>

<h1 align="center">PantrySnap</h1>

<p align="center">
  <strong>Your attentive kitchen cloud.</strong><br />
  Snap what’s in the fridge, track quantity and expiry, and cook it before it goes to waste.
</p>

<p align="center">
  <a href="https://cursor.com"><img alt="Made with Cursor" src="https://img.shields.io/badge/Made_with-Cursor-000000?style=for-the-badge&logo=cursor&logoColor=white" /></a>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img alt="Dexie" src="https://img.shields.io/badge/Dexie-IndexedDB-FF4F64?style=flat-square" />
  <img alt="Gemini" src="https://img.shields.io/badge/Google-Gemini-8E75B2?style=flat-square&logo=googlegemini&logoColor=white" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-optional_sync-3FCF8E?style=flat-square&logo=supabase&logoColor=white" />
  <img alt="PWA" src="https://img.shields.io/badge/PWA-installable-5A0FC8?style=flat-square&logo=pwa&logoColor=white" />
</p>

---

PantrySnap is a **mobile-first PWA**. Stock lives on-device in IndexedDB (including photos). AI — item detection, expiry analysis, recipes, and chat with **Steve** — goes through a small proxy so API keys never sit in the client.

> Organize. Track. Never waste again.

## What you can do

| Tab | What it’s for |
| --- | --- |
| **Home** | Tonight’s meals from what’s already in the fridge, with soon-to-expire ingredients called out first |
| **Fridge** | Real-shelf layout — freezer, top, middle, bottom, crisper, door, pantry |
| **Profile** | Alerts, Steve chat, account, install |

- **Photo capture** — add an item from a photo; Gemini fills name, category, quantity, and freshness notes
- **Expiry that isn’t a guess** — USDA FoodKeeper baselines, adjusted for opened / cooked / storage
- **Alerts** — expiring, expired, and low-stock in one list
- **Cook to beat expiry** — recipes ranked by on-hand match and urgency
- **Steve** — ask what’s expiring, what to cook tonight, or how long something lasts
- **Installable** — add to home screen; tracking works offline

## Screens

Home · Fridge · Profile. Chat is reached from Profile. Adding stock is a full-screen capture flow, not a tab.

## Stack

| Layer | Choice |
| --- | --- |
| App | React 19, Vite 8, TypeScript, Tailwind v4 |
| Motion | Motion + GSAP |
| Local data | Dexie (IndexedDB) — items, photos, cook log |
| PWA | `vite-plugin-pwa` — manifest, service worker, install prompt |
| Cloud (optional) | Supabase auth + sync |
| AI proxy | Hono on Node — Gemini (`2.5-flash` / `2.5-pro`) |
| Grounding | USDA FoodKeeper, Open Food Facts, TheMealDB / Spoonacular |

```
PWA  ──photo / prompt──▶  proxy (keys, rate limit)
                            ├─ Open Food Facts
                            ├─ USDA FoodKeeper
                            ├─ TheMealDB / Spoonacular
                            └─ Gemini (vision + text)
```

Detection and chat use Flash. Recipe generation uses Pro. Configure keys in `server/.env` — see `server/.env.example`.

## Run it locally

```bash
npm install
npm run dev          # app → http://localhost:5173
```

AI (detect, expiry analysis, recipes, chat) needs the proxy on **8787**:

```bash
cd server
npm install
cp .env.example .env   # add GEMINI_API_KEY
npm run dev
```

Vite proxies `/api` to the server in development. For production, set `VITE_API_BASE` to the deployed proxy URL.

```bash
npm run build
npm run preview
npm run icons        # regenerate PWA icons from steve.png
```

## Repo

- [PLAN.md](./PLAN.md) — product plan and data model
- [PHASING.md](./PHASING.md) — build phases
- [server/README.md](./server/README.md) — proxy details

Public repo: [github.com/polsalarm/PantrySnap](https://github.com/polsalarm/PantrySnap)

## License

TBD.

---

<p align="center">
  <img src="public/steve.png" alt="Steve" width="72" />
  <br />
  <strong>Made with <a href="https://cursor.com">Cursor</a></strong>
</p>
