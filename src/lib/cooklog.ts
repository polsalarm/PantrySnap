import { db, type CookEntry, type Item } from './db';
import { expiryStatus } from './expiry';

/**
 * Average edible weight of a single pantry item, in kg. The app tracks quantity
 * as a percentage rather than a mass, so "waste avoided" is necessarily an
 * estimate — surfaced in the UI with an "est." qualifier rather than as a
 * measured figure.
 */
const AVG_ITEM_WEIGHT_KG = 0.25;

export interface CookStats {
  mealsCooked: number;
  itemsRescued: number;
  /** Estimated, not measured. See AVG_ITEM_WEIGHT_KG. */
  wasteAvoidedKg: number;
}

/**
 * Record that a recipe was cooked. `onHand` is the current inventory so the
 * rescue tally reflects expiry state at cook time, which is the only moment it
 * can be measured — items may be edited or removed afterwards.
 */
export async function recordCook(
  recipeId: string,
  recipeTitle: string,
  ingredients: string[],
  onHand: Item[],
): Promise<void> {
  const used = onHand.filter((item) => {
    const name = item.name.toLowerCase().trim();
    return ingredients.some((ing) => {
      const needle = ing.toLowerCase().trim();
      return needle.includes(name) || name.includes(needle);
    });
  });

  const entry: CookEntry = {
    recipeId,
    recipeTitle,
    itemsUsed: used.map((i) => i.name),
    rescuedCount: used.filter((i) => i.expiryDate && expiryStatus(i.expiryDate) !== 'fresh').length,
    cookedAt: Date.now(),
  };

  await db.cookLog.add(entry);
}

export function computeStats(entries: CookEntry[]): CookStats {
  const itemsRescued = entries.reduce((sum, e) => sum + e.rescuedCount, 0);
  return {
    mealsCooked: entries.length,
    itemsRescued,
    wasteAvoidedKg: Math.round(itemsRescued * AVG_ITEM_WEIGHT_KG * 10) / 10,
  };
}
