# PantrySnap — Design System

A portable spec of the shipped design. Values are lifted from the Flutter
implementation (`flutter/lib/app/theme/`, `flutter/lib/core/widgets/`), so they
describe what actually renders, not an aspiration.

Nothing here is framework-specific. Every value is a raw hex, a point size or a
rule you can re-declare as CSS custom properties, Tailwind theme keys, SwiftUI
constants or design tokens.

**The look in one line:** warm paper ground, white plates outlined in deep slate
with a hard offset shadow, one red accent held in reserve for urgency.

---

## 1. Color

Deep slate `ink` does the structural work — every card is outlined in it. Colour
carries meaning, not decoration: red means *expiring*, amber means *soon*, green
means *fresh*. Category tints are deliberately desaturated so a mixed grid stays
calm.

### Core

| Token | Hex | Use |
|---|---|---|
| `bg` | `#F7F5F2` | app background — warm paper, never white |
| `surface` | `#FFFFFF` | cards, plates, input fills |
| `ink` | `#1E293B` | card outline, hard shadow, nav pill, primary buttons |
| `ink-soft` | `#475569` | card meta text, secondary body |
| `text` | `#1E293B` | primary text (same value as `ink`) |
| `text-muted` | `#8C8880` | tertiary text — warm grey, not a cool grey |
| `border` | `#ECE8E3` | dividers, inactive track fills |
| `border-soft` | `#F2EFEB` | subtle dividers |

### Accent & status

| Token | Hex | Use |
|---|---|---|
| `primary` | `#D92626` | **the single accent** — expiry urgency, focus ring |
| `primary-dark` | `#8E1515` | pressed state, rescue/urgency text on tinted cards |
| `primary-soft` | `#FDECEC` | expired badge background |
| `accent` | `#D97706` | amber — status badges only |
| `accent-dark` | `#9A3412` | "soon" badge foreground |
| `warn-soft` | `#FEF3C7` | "soon" badge background |
| `danger` | `#C81E1E` | expired badge foreground, error borders |
| `fresh` | `#16A34A` | fresh badge foreground, high-quantity bar |
| `fresh-soft` | `#DCFCE7` | fresh badge background |
| `sky` | `#0EA5E9` | supporting cue only — never a full-bleed background |
| `sky-soft` | `#E0F2FE` | — |
| `freezer-label` | `#245D89` | eyebrow labels on cool-tinted cards |

> A saturated sky background behind white cards is what made an earlier draft
> read as noisy. Sky stays a supporting tone.

### Meal tints — card fills by recipe category

| Category | Hex |
|---|---|
| Breakfast | `#F7EED6` |
| Lunch | `#E7EFD6` |
| Dinner *(and the default)* | `#F1F0EC` |
| Snack | `#E4EFF8` |
| Cool *(headers, freezer)* | `#DCEAF6` |

### Item tints — glyph wells by food category

| Category | Hex |
|---|---|
| Produce | `#DFEBC5` |
| Dairy | `#F5E7C0` |
| Meat, Seafood | `#EADFD6` |
| Bakery, Condiments | `#F1E7D6` |
| Pantry, Frozen, Beverages | `#DCEAF6` |
| Leftovers | `#F1F0EC` |
| *fallback* | `#EFEAE3` |

---

## 2. Typography

**Family:** Plus Jakarta Sans (Google Fonts), weights 400–800.

The scale is Material's default ramp; what carries the personality is the
**weight**. Headings and labels are `800`, body is `600`. There is almost no
`400` in the UI.

| Role | Weight | Notes |
|---|---|---|
| Display / headline | 800 | tracking `-0.6`, line-height `1.1` |
| Title (card headings) | 800 | |
| Body | 600 | `ink` at 70% opacity for supporting copy |
| Label — eyebrow | 800 | uppercase, letter-spacing `1.0` |
| Label — badge | 800 | uppercase, letter-spacing `0.4` |
| Label — nav, small meta | 600–800 | 10pt in the nav |

Eyebrows ("TONIGHT", "COOK TO BEAT EXPIRY") are uppercase, small and tightly
tracked — they're the main typographic signal that something is a section head.

---

## 3. Geometry

### Radii

| Token | Value | Use |
|---|---|---|
| `sm` | 12 | small chips, inner wells |
| `md` | 16 | inputs, standard cards |
| `lg` | 20 | cards |
| `xl` | 22 | large/hero cards |
| `pill` | 999 | buttons, badges, nav, quantity bars |

### Spacing

`4 · 8 · 12 · 16 · 20 · 28`, plus:

| Token | Value | Use |
|---|---|---|
| `page` | 20 | horizontal page gutter |
| `nav-clearance` | 80 | bottom padding on screens under the floating nav |
| `max-content-width` | 560 | content column cap on wide screens |

Page content is centred and capped at 560 — on a tablet or desktop the layout
becomes a centred column, not a stretched one.

---

## 4. The card system

Every surface in the app is the same primitive. Get this one right and the rest
follows.

```
background:    the card's own tint (default #FFFFFF)
border:        2px solid #1E293B
border-radius: 20  (22 when large)
box-shadow:    4px 4px 0 0 #1E293B     ← hard, zero blur
padding:       16  (varies for hero cards)
```

CSS:

```css
.card {
  background: var(--surface);
  border: 2px solid var(--ink);
  border-radius: 20px;
  box-shadow: 4px 4px 0 0 var(--ink);
  padding: 16px;
}
```

Structure comes from the **outline**, which is exactly what lets the fills carry
category colour without the grid turning noisy. The shadow is a hard offset with
no blur — a neo-brutalist sticker look, not a soft material elevation. Don't
soften it and don't add a second shadow layer.

**Implementation trap:** the shadow paints *outside* the element's box. If cards
live in a scroll container, the horizontal padding must be applied **inside**
that container, or the viewport clips the shadow at the right edge and the cards
look subtly truncated. The same applies to the last card's bottom shadow.

---

## 5. Components

### Button

Pill shape, `22×14` padding, label at weight 800, optional 18pt leading icon
with an 8pt gap. Three tones:

| Tone | Background | Foreground | Border |
|---|---|---|---|
| `ink` *(default)* | `#1E293B` | white | none |
| `marinara` | `#D92626` | white | none |
| `ghost` | `#FFFFFF` | `#1E293B` | 2px `ink` |

Disabled and busy states drop to `0.6` opacity over a 150ms fade. Busy swaps the
icon for a 16pt, 2px-stroke spinner. Buttons are full-width by default.

### Status badge

Pill, `8×3` padding, uppercase label at weight 800.

| State | Background | Foreground |
|---|---|---|
| Fresh | `#DCFCE7` | `#16A34A` |
| Soon | `#FEF3C7` | `#9A3412` |
| Expired | `#FDECEC` | `#C81E1E` |

### Quantity bar

8pt tall, fully rounded. Track `border`; fill `fresh`, flipping to `primary` at
**≤ 20%**. The colour flip is the whole point — it's the low-stock signal.

### Glyph well

Circle, 2px `ink` border, filled with the item's category tint, centred icon.
Sizes in use: 42 (compact), 48 (default), 64 (hero).

### Input

White fill, 2px `ink` border, radius 16, padding `16×14`. Focus swaps the border
to `primary`; error swaps it to `danger`. Border width never changes — only its
colour — so the field doesn't shift on focus.

### Floating nav

A dark `ink` pill at 90% opacity (`#1E293B` at `E6` alpha), floating over the
content rather than sitting in a bar.

- Overlay it; give it **no layout space of its own**. Screens reserve clearance
  with their own bottom padding (`nav-clearance`, 80) so content scrolls
  *under* it.
- Inset 16 from each side, 12 from the bottom safe area, capped at 480 wide.
- Radius `pill`, shadow `0 10px 24px rgba(16,23,42,0.26)`.
- Each tab: icon over a 10pt label, both white. Selected gets a filled icon at
  22pt (vs 20), weight 800, and a `white @ 10%` pill behind it, animated over
  180ms.

Tabs: **Home · Fridge · Steve · Profile**. Secondary destinations (alerts, items,
account) are reached from Profile, not from the nav.

---

## 6. Layout rules

- **Page shell:** safe area → centred column capped at 560 → `20` side gutters,
  `20` top.
- **Scrolling screens own their padding.** Apply the page insets inside the
  scroll view, never outside it — see the card-shadow trap above.
- **Vertical rhythm:** 16 between major cards, 12 between list tiles, 8–10
  inside a card.
- **Responsive:** below 420pt wide, recipe tiles stack in one column; above, they
  wrap into two.
- **Screens with a pinned bottom bar** (the chat composer) reserve nav clearance
  as real space instead of scrolling under the nav.

---

## 7. Voice

Worth carrying over — the copy is part of the design.

- Plain and direct. "Cook before it spoils", not "Optimize your consumption".
- Honest empty states that name the next action: "Add a few staples to your
  fridge and we'll match recipes to what you already have."
- Urgency is stated in human time — "Use by tomorrow", "1 day", "Uses Milk
  first" — never a raw date.
- Steve, the mascot, appears at 52–72pt beside headings. He is a presence, not a
  brand lockup; he never gets a caption.

---

## 8. Porting checklist

1. Declare the colour tokens. Resist adding a second accent.
2. Load Plus Jakarta Sans; set your default body weight to 600, headings to 800.
3. Build the card primitive with the hard offset shadow. Verify it isn't clipped
   inside scroll containers.
4. Build button, badge, quantity bar and glyph well on top of it.
5. Float the nav as an overlay; reserve clearance in each screen's scroll
   padding.
6. Cap content at 560 and centre it.
