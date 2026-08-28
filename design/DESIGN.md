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

## Color tokens (Cloudy with a Chance of Meatballs — restrained)

The palette's calm comes from a **warm paper ground, white plates, deep slate text, and
one accent**. Marinara red is reserved for expiry urgency; amber and green appear only
inside status badges. Sky blue is a supporting tone and is never used as a full-bleed
background — a saturated sky behind white cards is what made the earlier draft noisy.

| Token | Hex | Use |
|-------|-----|-----|
| `bg` | `#F7F5F2` | app background (warm paper, the poster's ground tone) |
| `surface` | `#FFFFFF` | cards & plates |
| `text` | `#1E293B` | primary text (deep roast slate) |
| `text-muted` | `#8C8880` | secondary text (warm grey) |
| `primary` | `#D92626` | **the single accent** — expiry urgency, active nav (marinara) |
| `primary-dark` | `#8E1515` | pressed / simmered sauce dark red |
| `primary-soft` | `#FDECEC` | tomato cream highlight |
| `accent` | `#D97706` | cheddar amber — status badges only |
| `accent-dark` | `#9A3412` | deeper toasted syrup |
| `warn-soft` | `#FEF3C7` | melted cheese / soon alert highlight |
| `danger` | `#C81E1E` | expired badge |
| `border` | `#ECE8E3` | card borders / dividers |
| `border-soft` | `#F2EFEB` | subtle dividers |
| `sky` | `#0EA5E9` | supporting weather cue only |
| `fresh` | `#16A34A` | crisp lettuce / fresh badge |
| `ink` | `#1E293B` | card outline + hard offset shadow |
| `ink-soft` | `#475569` | card meta text |

**Category tints** (card fills — muted so a mixed grid still reads calm):
`Breakfast #F7EED6` · `Lunch #E7EFD6` · `Dinner #F1F0EC` · `Snack #E4EFF8` · `cool #DCEAF6` (headers, freezer)

**Card system:** every card is a `.card-plate` — 2px `ink` border + `4px 4px 0` hard offset
shadow. Structure comes from the outline, which is what lets the fills carry category
colour without the grid turning noisy.

**Tabs (4):** Home · Fridge · Recipes · Profile, in a dark `ink` pill nav.
`/alerts`, `/chat`, `/items` and `/account` stay live, reached from the Profile tab.


**Status badges:** Fresh = crisp lettuce (`#16A34A` / emerald), Soon = melted cheese (`#D97706` / amber), Expired = meatball red (`#DC2626` / red).

---

## Typography

- **Font family:** `Plus Jakarta Sans` (Google Fonts), weights 400/500/600/700/800.
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
