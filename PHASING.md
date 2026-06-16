# PantrySnap — Build Phasing

Mobile-first PWA. Local-first MVP, cloud later. Each phase ships something usable.

---

## Phase 0 — Scaffold & PWA shell
**Goal:** installable empty app.
- Vite + React + TS project
- Tailwind setup, mobile-first base layout
- `vite-plugin-pwa`: manifest, icons, service worker, offline shell
- App routing (shelves / items / alerts / recipes tabs)
- Warm/earthy theme from concept (cream bg, dark green + tan accents)
**Done when:** installs to home screen, loads offline, empty tabs render.

---

## Phase 1 — Items & local storage
**Goal:** add/edit/remove items.
- IndexedDB via Dexie, `Item` model
- Add Item form: name, category, quantity slider (%), expiry date
- Photo capture (`<input capture>`), store blob in IndexedDB
- Item list view, edit, delete
**Done when:** can CRUD items with photo + expiry, persists offline.

---

## Phase 2 — Fridge / shelf view (the "real life" view)
**Goal:** view pantry like real life.
- Shelf model (Top / Middle / Bottom / Crisper / Door / pantry sections)
- Shelf navigation, assign items to shelves
- Per-shelf "at a glance" list: photo, name, expiry, qty %
**Done when:** browse by shelf, see items grouped visually.

---

## Phase 3 — Expiry reminders & low-stock alerts
**Goal:** never waste again.
- Alerts view: filter All / Expiring soon / Low stock
- Expiry status badges (fresh / soon / expired)
- Low-stock threshold per item
- Web Notifications + service worker scheduled checks
**Done when:** get notified for expiring + low-stock items; alerts tab works.

---

## Phase 4 — Recipes (cook with what you have)
**Goal:** cook from on-hand items.
- Recipe model + seed recipe set
- Match engine: rank recipes by # of on-hand ingredients
- "Based on your ingredients" view, X/Y ingredients shown
**Done when:** recipe tab lists makeable recipes ranked by match.

---

## Phase 4.5 — Cook to beat expiry (auto)
**Goal:** never waste again — auto-cook the soonest-to-expire stuff.
- Expiry-weighted scoring: bias match engine toward items expiring soonest
- "Cook this now" auto-pick: top recipe using near-expiry ingredients
- Surface which expiring items each recipe rescues (e.g. "uses 2 items expiring in 3 days")
- Optional: tie into Phase 3 alerts — expiry notification links straight to suggested recipe
**Done when:** app auto-suggests a recipe that prioritizes near-expiry items; one tap from an expiry alert.

---

## Phase 5 — Polish & UX
**Goal:** production feel.
- Empty states, loading, animations
- Search & filter items
- Accessibility, performance, Lighthouse PWA pass
- Onboarding flow
**Done when:** smooth, passes PWA audit.

---

## Phase 6 — Cloud sync & accounts (optional / later)
**Goal:** multi-device.
- Auth + backend (Supabase/Firebase)
- Sync items/photos across devices
- Conflict handling
**Done when:** same data on multiple devices.

---

## Future / backlog
- Barcode scan to add items
- AI auto-detect items from shelf photo
- Shopping list generation from low-stock
- Household sharing
- External recipe API

---

> **Your new feature goes here** — tell me what to add and I'll slot it into a phase.
