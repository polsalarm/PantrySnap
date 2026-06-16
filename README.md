# 🥫 PantrySnap

> **A visual pantry & fridge organizer — powered by AI.**
> Snap a photo of your shelves, track what you own, quantity, and expiry dates —
> then let AI tell you what to cook before food goes to waste.
>
> **Organize. Track. Never waste again.**

Built as a **mobile-first PWA** (installable, offline-capable).

---

## ✨ Features

### Core
- 🧊 **View your fridge like real life** — photo-based shelf layout (Top, Middle, Bottom, Crisper, Door, pantry sections). Tap a shelf to see its items.
- 👀 **See what you have at a glance** — per-shelf list with photo, name, expiry date, quantity %.
- 📊 **Track quantity & expiry** — quantity slider (% left), purchase date, expiry date per item.
- 🧮 **Smart expiry estimate** — asks *"when did you buy it?"* on add, then estimates expiry from purchase date + real shelf-life data (USDA FoodKeeper) for that category & storage. Override anytime.
- 🔔 **Expiry reminders & low-stock alerts** — get notified before food spoils or runs out.
- 🍳 **Cook with what you have** — recipes ranked by how many on-hand ingredients match.
- ⏳ **Cook to beat expiry** — auto-suggests a recipe that uses your soonest-to-expire items first. *Use it before you lose it.*

### 🤖 AI-powered
- 📷 **Auto-detect items from photo** — snap a shelf, AI identifies items and pre-fills name, category, and estimated quantity. No manual typing.
- ✍️ **AI recipe generation** — generates full recipes (ingredients + steps) from your on-hand and near-expiry items, not just a fixed seed list.
- 💡 **Smart expiry & usage tips** — AI suggests how to store/use items, flags what to cook first, nudges to cut waste.
- 💬 **Chat assistant** — ask *"what can I cook tonight?"* or *"what's expiring this week?"* — conversational over your own pantry data.

---

## 🛠 Tech Stack

| Layer | Choice |
|-------|--------|
| **Frontend** | React + Vite + TypeScript |
| **PWA** | `vite-plugin-pwa` (manifest, service worker, offline, installable) |
| **Styling** | Tailwind CSS — warm / earthy palette (cream bg, dark green + tan accents) |
| **State** | Zustand |
| **Local data** | IndexedDB via Dexie (offline-first; items + photos as blobs) |
| **Camera** | Device camera via `<input capture>` / `getUserMedia` |
| **Notifications** | Web Notifications API + service worker |
| **AI** | Google Gemini — `2.5-flash` for detection/chat, `2.5-pro` for recipe generation |
| **Data sources** | Open Food Facts (products), USDA FoodKeeper (shelf-life), TheMealDB/Spoonacular (recipes), Gemini Google Search grounding |
| **AI backend** | Thin serverless proxy (keeps API key off the client) |
| **Cloud (later)** | Supabase / Firebase — sync + auth across devices |

> **Local-first.** The app works fully offline for tracking. AI features call out to a
> small backend proxy — the Gemini API key **never** lives in the PWA client.

---

## 🤖 AI Architecture

The PWA is a public client, so it **cannot** safely hold an API key. AI calls route through
a thin backend proxy:

The PWA never calls Gemini or third-party APIs directly. A thin backend proxy holds keys,
fetches real data, then grounds Gemini with it (hybrid RAG — real data in, less hallucination):

```
                          ┌─▶ Open Food Facts  (product info)
PWA client ─(photo/prompt)─▶ Backend proxy ─┼─▶ USDA FoodKeeper   (shelf-life)
                          │  (keys, RAG,     ├─▶ TheMealDB/Spoonacular (recipes)
                          │   rate-limit)    └─▶ Gemini API (vision + text, Search grounding)
                          ▼
                    grounded result
```

| Feature | Model | Real-data grounding |
|---------|-------|---------------------|
| **Item detection** | `gemini-2.5-flash` | photo → structured `{name, category, qty%}[]`; name reconciled vs Open Food Facts |
| **Recipe generation** | `gemini-2.5-pro` | seeded with real recipes (TheMealDB/Spoonacular) matching on-hand + near-expiry items |
| **Smart tips** | `gemini-2.5-flash` | shelf-life / storage from USDA FoodKeeper dataset |
| **Chat assistant** | `gemini-2.5-flash` | pantry data + Gemini Google Search grounding for fresh info |

Why tiered: detection + chat are high-frequency → Flash (cheap/fast). Recipe quality matters → Pro.
Configure keys in the backend `.env` — see `.env.example` (added during setup).

---

## 🗺 Roadmap

Built in phases — each ships something usable. See **[PHASING.md](./PHASING.md)** for detail.

- **P0** — Scaffold + PWA shell
- **P1** — Items + local storage (CRUD + photo)
- **P2** — Fridge / shelf view
- **P3** — Expiry reminders & low-stock alerts
- **P4** — Recipes (cook with what you have)
- **P4.5** — Cook to beat expiry (expiry-weighted auto-suggest)
- **P5** — Data layer (Open Food Facts, USDA FoodKeeper, recipe APIs) + backend proxy
- **P6** — AI features (photo detect, recipe gen, tips, chat) — Gemini, grounded
- **P7** — Polish & UX (Lighthouse PWA pass)
- **P8** — Cloud sync & accounts *(optional)*

---

## 🚀 Getting Started

Phases 0–4 are implemented: PWA shell, item CRUD with photo + expiry, shelf
view, alerts, and recipe matching.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build + service worker
npm run preview  # serve the production build locally
```

---

## 📦 Project Docs

- **[PLAN.md](./PLAN.md)** — full project plan, data model, success criteria
- **[PHASING.md](./PHASING.md)** — build phases

---

## 📄 License

TBD.
