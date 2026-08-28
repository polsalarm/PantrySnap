# Bounty Cloud Rebrand — Design Spec

**Date:** 2026-08-28
**Status:** approved by user (design conversation), pending implementation plan

## 1. Summary

Rebrand PantrySnap as **Bounty Cloud**, a *Cloudy with a Chance of Meatballs*–inspired
identity: the fridge/pantry is framed as the user's own personal food-weather machine.
This is a full identity + visual + copy pass across the existing app — not a rewrite of
app behavior. Data model, routing, API contract, and AI/backend logic are untouched.

- **Name:** Bounty Cloud (was PantrySnap)
- **Tagline:** "Your kitchen's weather machine." / "Abundance on tap — no waste, ever."
- **Concept:** scanning "summons" food, alerts are "storm warnings," a generated recipe
  "clears the skies." The AI photo-detect feature is the closest in-app analog to the
  movie's FLDSMDFR machine — it's what turns a photo into a shelf full of tracked food.
- **IP note:** we are building an *original* voice inspired by the movie's tone (an
  invented, whimsical weather-machine concept), not reusing the movie's title, the
  invented word "FLDSMDFR," character names, or any of its copyrighted art/marks.

## 2. Visual system

### 2.1 Palette (replaces `src/index.css` `@theme` block)

| Token | Current | New | Use |
|---|---|---|---|
| `--color-bg` | `#FBF9F8` warm off-white | `#EAF4FC` pale sky blue | app background |
| `--color-surface` | `#FFFFFF` | `#FFFFFF` | cards (unchanged — keeps contrast) |
| `--color-text` | `#1B1C1C` | `#1C2733` deep slate-blue | primary text |
| `--color-text-muted` | `#717970` | `#5B6B7A` | secondary text |
| `--color-primary` | `#164525` dark green | `#2E86D8` sky blue | primary buttons, active nav, "Make it Rain" CTA |
| `--color-primary-dark` | `#00210B` | `#1C5FA0` | pressed state |
| `--color-primary-soft` | `#A0D3A7` | `#BFE0F7` | light accents / active nav pill bg |
| `--color-accent` | `#904C25` terracotta | `#F5B700` sunny yellow | secondary accents, highlight moments |
| `--color-accent-dark` | `#783A14` | `#D69A00` | deeper yellow |
| `--color-warn-soft` | `#FFB690` peach | `#FFD37A` warm gold | "soon"/storm-warning badge bg |
| `--color-danger` | `#93000A` | `#E0472C` fruit red-orange | expired badge / storm alerts |
| `--color-border` | `#E4E2E1` | `#D6E6F2` | card borders / dividers |
| `--color-border-soft` | `#DCD9D9` | `#E9F2FA` | subtle dividers |

`StatusBadge` keeps its 3-state semantic (fresh/soon/expired) but its Tailwind utility
classes (currently `emerald`/`amber`/`red` literals, not theme tokens — see
`src/components/StatusBadge.tsx:5-8`) move onto the new theme tokens so the whole app
reads as one palette instead of mixing raw Tailwind colors with theme tokens.

### 2.2 Shape language

- Bump default card radius from `rounded-2xl` to `rounded-3xl` where cards are
  freestanding (shelf cards, item cards, chat bubbles); pills/buttons go fully rounded
  (`rounded-full`, already used in some places).
- New reusable **cloud-blob** treatment: a CSS shape (multiple overlapping
  `border-radius` circles via `::before`/`::after`, or a single `clip-path: path(...)`)
  used as a card-header background on `FridgeHome` shelf cards and the `Recipes` hero
  card — replaces flat rounded-rect headers with a soft cloud silhouette. Pure CSS, no
  image assets.
- Icons stay **Material Symbols Outlined** (`src/components/Icon.tsx`) — only recolored.
  The one new custom asset is the cloud + food-drop mark (§2.3).

### 2.3 Mark / logo

New `scripts/icon.svg`: a simple flat cloud silhouette (sky blue, `--color-primary`)
with a single stylized food-drop (a rounded teardrop, sunny yellow) suspended just below
it, mid-fall. Must read clearly at 32×32 (favicon) and as a maskable icon (safe-zone
circle at 512px per the maskable-icon spec — check against the existing
`gen-icons.mjs` maskable padding logic). Regenerated into `public/icons/*`,
`public/favicon-32.png`, `public/apple-touch-icon.png` via the existing
`scripts/gen-icons.mjs` (sharp-based) — no new tooling.

## 3. Copy voice — full storybook

Full whimsy in navigation and primary actions; every renamed label keeps a recognizable
underlying action so it stays usable, not just cute.

| Surface | Current | New |
|---|---|---|
| Bottom nav (`BottomNav.tsx` `TABS`) | Fridge · Items · Alerts · Recipes · Chat | Cloud · Pantry · Storm Alerts · Recipes · Chat |
| FridgeHome title (`TopBar`) | "PantrySnap" | "Bounty Cloud" |
| Alerts title | "Kitchen Alerts" | "Storm Alerts" |
| Chat title | "Kitchen Assistant" | "Cloud Assistant" |
| ItemForm save CTA (`ItemForm.tsx:501`) | "Save to Fridge" | "☁ Make it Rain" |
| FridgeHome empty state | "No items yet — tap to add some." | "Your cloud is clear — summon some groceries!" |
| ShelfDetail empty state | "No items on this shelf yet." | "Nothing's fallen here yet." |
| Alerts empty state | "Nothing to flag right now. Nice work!" | "Clear skies — nothing brewing. Nice work!" |
| Expiry "soon" label (`expiryLabel`) | "Expiring in N days" | "Storm's brewing — N days left" (keep the plain `Use by tomorrow` / `Expired Nd ago` wording as-is; those are safety-relevant and should stay unambiguous) |

Two constraints carried over from the current AI vision prompt's own philosophy (never
assert food safety from a photo alone): **expiry and safety-critical copy stays literal.**
Whimsy applies to chrome, empty states, and celebratory moments — not to "this is
expired" or dates themselves.

`AiLock` labels, form field labels (`Name`, `Storage Location`, `Purchased On`,
`Condition notes`), and aria-labels stay plain for accessibility/clarity — screen readers
and quick scanning shouldn't have to parse whimsy to find the save button.

## 4. Signature animation — "Make it Rain"

- **Trigger:** app open/splash (per user decision — a consistent framing device, not
  tied to a specific action).
- **Behavior:** ~1.5–2s sequence: a cloud mark appears, small food-icon shapes (reusing
  Material Symbols food glyphs already available, e.g. `egg`, `nutrition`, `bakery_dining`)
  fall from it with a light bounce/settle, resolving into the "Bounty Cloud" wordmark.
- **Implementation:** pure CSS `@keyframes` in `src/index.css`, following the existing
  pattern (`fade-up`, `shimmer`, `orbit-spark`) — no animation library. New component
  `src/components/SplashRain.tsx` mounted once at the top of `App.tsx`, gated by a
  session-scoped flag (`sessionStorage`) so it plays once per session, not on every route
  change.
- **Accessibility:** wrapped by the existing `@media (prefers-reduced-motion: reduce)`
  block in `index.css` (`index.css:78-84`) — already global, so this is inherited for
  free as long as the component uses the same animation classes/timing model.

## 5. Technical rename (full depth)

| Item | Change |
|---|---|
| `package.json` (root) | `"name": "pantrysnap"` → `"bountycloud"` |
| `server/package.json` | same |
| PWA manifest (`vite.config.ts`, `VitePWA({...})` config) | `name`, `short_name`, `id` → Bounty Cloud identity; update `theme_color`/`background_color` to new palette |
| `scripts/icon.svg` | replaced with cloud/food-drop mark (§2.3) |
| `public/icons/*`, `favicon-32.png`, `apple-touch-icon.png` | regenerated via `node scripts/gen-icons.mjs` |
| `index.html` | `<title>`, meta theme-color, any PantrySnap references |
| `README.md`, `PLAN.md`, `PHASING.md`, `CHECKLIST.md`, `DATA_LAYER.md` | update project name references (content/history stays factual — these are project docs, not user-facing copy, so tone stays plain) |
| Folder rename `PantrySnap/` → `BountyCloud/` | **separate confirmed step**, done last, after everything else is verified working — filesystem/repo move, not a code edit |
| GitHub repo rename (if desired) | user's call at execution time; `gh repo rename` — also a separate confirmed step |

Left untouched: Dexie DB name (`new Dexie('pantrysnap')` in `src/lib/db.ts`) — renaming
this would invalidate every existing user's local IndexedDB data. **Do not rename the
Dexie database identifier.** This is a deliberate exception to "full rename."

## 6. What stays untouched

- Data model (`Item`, `Shelf` shapes), Dexie schema/migrations
- API contract (`server/src/app.ts` routes, request/response shapes)
- AI/backend logic (`server/src/sources/*`)
- Routing structure (`App.tsx` route paths — only nav *labels* change, not URLs)
- Supabase schema / sync logic

## 7. Rollout / verification

1. Palette + shape + mark first (visually testable immediately via `npm run dev`).
2. Copy pass page by page.
3. Splash animation component last (depends on new mark + palette existing).
4. Technical rename (package/manifest/icons/docs) — regenerate icons, confirm PWA
   install identity looks right (`verify-before-done` skill: check in an actual browser,
   not just code review, per the project's own convention for visual changes).
5. Folder/repo rename — separate, explicitly confirmed step, done last.

## 8. Out of scope (this pass)

- New illustrated art per screen (using CSS cloud-blob shapes + recolored Material
  Symbols instead — see §2.2)
- Renaming the Dexie DB identifier (§5, deliberate exception)
- Any change to AI prompts, data sources, or the API contract
- Multi-language/localized copy (storybook voice is English-only for now)
