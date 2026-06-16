# PantrySnap — Design Basis

Source: **Google Stitch** project *"PantrySnap Visual Organizer"* (`projects/2139819103013812304`).
Screens + HTML exported to `design/screens/` (PNG) and `design/html/` (reference markup).
This file is the source of truth for the Phase 0 Tailwind theme.

---

## Screens (6)

| File | Screen | Notes |
|------|--------|-------|
| `01-fridge-home` | **Fridge View (Home)** | "Your Fridge" — shelf cards (Top/Middle/Crisper/Door) with item thumbnails + count, expand chevron |
| `02-shelf-detail` | **Shelf Detail** | e.g. "Crisper Drawer" — 2-col item grid, status badge (Fresh/Soon/Expired), Qty % bar |
| `03-add-item-scan` | **Add to Pantry (Scan)** | camera + "Item Recognized" pill; form: name, Category, Storage Location, Quantity slider, **Purchased On**, **Expiry Date (ESTIMATED tag)**, "Save to Fridge" |
| `04-alerts` | **Kitchen Alerts** | filter chips All / Expiring Soon / Low Stock; item cards with "Use by Tomorrow", "Cook this now", low-stock %, "Add to List" |
| `05-recipes` | **Recipes** | "Cook with what you have"; hero expiry-rescue card ("Cook to beat expiry"), match % badges, ingredient match |
| `06-chat-assistant` | **Kitchen Assistant** | chat UI, suggested chips ("What can I cook tonight?", "What's expiring this week?"), "Ask anything…" |

**Bottom nav (5 tabs):** Fridge · Items · Alerts · Recipes · Chat. Active tab = filled green pill + label.

---

## Color tokens (extracted from Stitch HTML)

| Token | Hex | Use |
|-------|-----|-----|
| `bg` | `#FBF9F8` | app background (warm off-white) |
| `surface` | `#FFFFFF` | cards |
| `text` | `#1B1C1C` | primary text |
| `text-muted` | `#717970` | secondary text |
| `primary` | `#164525` | primary buttons (Cook this now, Save to Fridge), active nav |
| `primary-dark` | `#00210B` | pressed / darkest green |
| `primary-soft` | `#A0D3A7` | light green accents / fresh badge bg |
| `accent` | `#904C25` | terracotta — warnings, low-stock bar |
| `accent-dark` | `#783A14` | deeper terracotta |
| `warn-soft` | `#FFB690` | "soon" / peach highlight |
| `danger` | `#93000A` | expired badge / "Use by tomorrow" |
| `border` | `#E4E2E1` | card borders / dividers |
| `border-soft` | `#DCD9D9` | subtle dividers |

**Status badges:** Fresh = green (`primary-soft`/`primary`), Soon = peach/terracotta (`warn-soft`/`accent`), Expired = red (`danger`).

---

## Typography

- **Font family:** `Plus Jakarta Sans` (Google Fonts), weights 400/500/600/700.
- **Icons:** `Material Symbols Outlined`.

---

## Component patterns

- Rounded cards (`~rounded-2xl`), soft shadow, generous padding.
- Pill chips for filters + suggested questions.
- Quantity = horizontal % bar (green when high, terracotta when low).
- Expiry shown as colored badge + relative text ("Use by tomorrow", "Expiring in 3 days").
- Full-width dark-green primary CTA buttons.

> Phase 0: encode these tokens + font into `tailwind.config` theme. Use the PNGs as visual
> reference and the HTML as layout reference (do not ship Stitch HTML as-is — rebuild as React components).
