# PantrySnap Expiry Analysis Handoff

## Current State

PantrySnap currently estimates expiry dates from structured shelf-life data, not from true food-safety AI prediction.

The current flow is:

1. The frontend creates an immediate local estimate from `src/lib/expiry.ts`.
2. The item form calls `/api/shelflife` when the backend is reachable.
3. The backend reads the bundled seed dataset in `server/src/data/foodkeeper.json` through `server/src/sources/shelflife.ts`.
4. The expiry date becomes `purchaseDate + shelfLifeDays`.
5. Photo AI can identify food item/category/quantity and now asks for visible freshness notes, but it does not yet adjust the expiry date with a full analysis model.

Important limitation: `server/src/data/foodkeeper.json` is a small hard-coded seed subset. It is useful as an offline fallback, but it should not be treated as the final production source of truth.

## Changes Already Added

### Welcome Page Readability

Updated `src/pages/Welcome.tsx`:

- Increased hero/title/body/button font sizes.
- Improved vertical spacing and layout balance.
- Replaced the can emoji with a Material Symbols icon badge.
- Updated value prop icons and card styling.

### Recipe Matching Accuracy

Updated `src/pages/Recipes.tsx`:

- Fixed recipe fraction mismatch by deriving `matchCount/totalCount` from the same missing-ingredient list shown in the UI.
- Normalized ingredient comparison so casing does not skew missing counts.

### Recipe Generation Animations

Updated `src/pages/Recipes.tsx` and `src/index.css`:

- Added a loading card while local/API recipe matches are being generated.
- Added signed-in AI recipe generation animation with shimmer and animated sparkle icon.
- Added an AI loading explanation card: matching pantry items, rescuing expiring items, and writing practical steps.

### Expiry Explanation UI

Updated `src/pages/ItemForm.tsx`:

- Added an `Expiry analysis` card below the expiry date.
- Shows whether the estimate came from FoodKeeper-style data or local fallback.
- Explains the formula: purchase date + shelf-life days for category/storage.
- Adds guidance that photo scan gives better analysis than manual entry.

### Photo Analysis Prompt

Updated `server/src/sources/ai.ts` and `src/lib/api.ts`:

- Extended photo detection response with optional:
  - `freshnessNote`
  - `expirationNote`
  - `confidence`
- Updated Gemini vision prompt to look for visible freshness signals such as browning, wilting, damaged packaging, mold, cloudy liquid, or no visible issue.
- Prompt explicitly says not to claim food is safe from image alone.

### User Condition Notes

Updated `src/lib/db.ts`, `src/lib/sync.ts`, `supabase/schema.sql`, and `src/pages/ItemForm.tsx`:

- Added optional `conditionNotes` locally.
- Added `condition_notes` to Supabase sync row mapping and schema.
- Added a `Condition notes` textarea on the item form.
- Added quick chips:
  - opened
  - cooked
  - sealed
  - smells off
  - mold visible
- Shows user notes inside the `Expiry analysis` card so future AI analysis can factor them in.

## Recommended Next Step

Build a real backend endpoint:

`POST /api/expiry/analyze`

Suggested request body:

```json
{
  "name": "milk",
  "category": "dairy",
  "storage": "fridge",
  "purchaseDate": "2026-06-17",
  "expiryDateCurrent": "2026-06-24",
  "conditionNotes": "opened yesterday, sealed",
  "photoAnalysis": {
    "freshnessNote": "No visible spoilage on packaging.",
    "expirationNote": "Image cannot confirm safety, but category appears to be dairy."
  }
}
```

Suggested response:

```json
{
  "estimatedExpiryDate": "2026-06-23",
  "baselineDays": 7,
  "adjustedDays": 6,
  "source": "foodkeeper+ai",
  "confidence": "medium",
  "reasoning": [
    "FoodKeeper baseline for dairy in fridge is 7 days.",
    "User note says opened yesterday, so estimate is slightly shortened.",
    "Photo shows no obvious visual spoilage, but image alone cannot confirm safety."
  ],
  "safetyNote": "When in doubt, discard food that smells off, has mold, or has unsafe texture/color changes."
}
```

## Better Data Source Plan

Keep `foodkeeper.json` as fallback, then improve source quality:

1. Expand the bundled FoodKeeper dataset from official USDA/FoodSafety.gov data if a reusable export is available.
2. Use Open Food Facts for packaged product metadata when product name/barcode/photo can identify an item.
3. Store baseline shelf-life records as structured data with source, category, storage, min/max days, and notes.
4. Use AI only as a context and explanation layer, not the only source of truth.
5. Make the UI show why the date was estimated instead of just showing a date.

## Implementation Notes For Claude

- Do not remove the local fallback table; it keeps the app local-first/offline.
- Avoid claiming exact safety from image analysis.
- Treat user notes like `mold visible` or `smells off` as high-risk signals and surface a discard/safety warning.
- If Supabase is already deployed, add a migration for `condition_notes text`; editing `supabase/schema.sql` only helps new installs.
- Consider adding persisted fields later:
  - `expiry_analysis_reasoning`
  - `expiry_confidence`
  - `expiry_analysis_source`
  - `photo_freshness_note`
  - `photo_expiration_note`

## Verification Already Run

Before this handoff, `npm run build` and linter checks passed after the recipe animation and expiry analysis changes.

Run again after continuing from this file:

```bash
npm run build
```
