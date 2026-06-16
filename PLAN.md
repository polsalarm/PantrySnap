# PantrySnap — Project Plan

> A visual pantry & fridge organizer. Take photos of your shelves, track what you
> own, quantity, and expiry dates — then cook with what you already have.
> **Organize. Track. Never waste again.**

Built as a **PWA, mobile-first**.

---

## 1. Vision

Open the app and see your fridge/pantry _like it's real life_ — photo-based shelves
with your actual items. Track quantity (% left) and expiry, get reminders before food
spoils and low-stock alerts, and discover recipes you can make right now from your
on-hand ingredients.

**Goal:** reduce food waste, save money, make meal planning easy.

---

## 2. Target Users

- Busy individuals & families
- People who meal prep
- Anyone reducing food waste
- People who love cooking

---

## 3. Core Features (from concept)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **View fridge like real life** | Photo-based shelf layout (Top Shelf, Middle, Bottom, Crisper, Door). Tap shelf to see items. |
| 2 | **See what you have at a glance** | Per-shelf item list with photo, name, expiry date, qty %. |
| 3 | **Track quantity & expiry** | Edit item: photo, category, quantity slider (% left), expiry date. |
| 4 | **Expiry reminders & low-stock alerts** | Notifications for expiring soon + low stock. Filter by All / Expiring / Alerts. |
| 5 | **Cook with what you have** | Recipe suggestions ranked by how many on-hand ingredients match. |
| 6 | **Cook to beat expiry (auto)** | Auto-suggest a recipe that uses your soonest-to-expire items first. "Use it before you lose it" — prioritizes near-expiry ingredients in the match/ranking. |
| 7 | **AI: auto-detect items from photo** | Snap a shelf → Gemini vision identifies items, pre-fills name/category/qty %. |
| 8 | **AI: recipe generation** | Generate full recipes (ingredients + steps) from on-hand + near-expiry items, beyond a fixed seed list. |
| 9 | **AI: smart expiry & usage tips** | Storage/usage suggestions, cook-first nudges, waste-reduction guidance. |
| 10 | **AI: chat assistant** | Conversational over pantry data — "what can I cook tonight?", "what's expiring?". |

**Visual flow:** photo → organize by shelf → add qty + expiry → get reminders → plan meals.

---

## 4. Tech Stack (proposed)

PWA, mobile-first. Offline-capable.

- **Frontend:** React + Vite + TypeScript
- **PWA:** `vite-plugin-pwa` (service worker, manifest, installable, offline)
- **Styling:** Tailwind CSS (mobile-first utility) — warm/earthy palette matching concept
- **State:** Zustand or React Context
- **Local data:** IndexedDB (via Dexie) — works offline, stores items + photos
- **Photos:** device camera via `<input capture>` / `getUserMedia`, stored as blobs in IndexedDB
- **Notifications:** Web Notifications API + service worker for expiry/low-stock
- **AI:** Google Gemini — multimodal (vision) for photo item detection, text for recipe gen / tips / chat
- **AI backend:** thin serverless proxy holding the Gemini API key (never on the PWA client)
- **Backend (later phase):** optional — Supabase/Firebase for sync across devices + auth
- **Recipes:** match engine over ingredient list + AI generation; optional external recipe API

> Local-first first. Core tracking works with zero backend. AI features call a small proxy;
> they degrade gracefully offline. Cloud sync is a later phase.

---

## 5. Data Model (draft)

```
Item {
  id: string
  name: string
  photoBlobId: string
  shelf: enum(top|middle|bottom|crisper|door|pantry-section...)
  category: string
  quantityPct: number        // 0-100, % left
  expiryDate: date
  lowStockThresholdPct: number
  createdAt, updatedAt
}

Shelf {
  id, name, order, photoBlobId?
}

Recipe {
  id, name, photo, ingredients[], steps[]
}
```

---

## 6. Out of Scope (MVP)

- Multi-user accounts / sharing
- Barcode scanning
- Cloud sync

(All candidates for later phases — see PHASING.md.)

> **Note:** AI features (photo item detection, recipe generation, tips, chat) are now
> **in scope** as Phase 5. They route through a thin backend proxy so the Gemini API key
> never ships in the PWA client.

---

## 7. Success Criteria

- Installable PWA on mobile, works offline
- Add item with photo + expiry in < 20s
- Reliable expiry + low-stock notifications
- Recipe view shows makeable recipes ranked by on-hand match

---

See **PHASING.md** for build phases.
