// Open Food Facts product lookup. Free, no API key.
// Docs: https://world.openfoodfacts.org/data
import { cached, TTL } from '../lib/cache.js';

export interface ProductInfo {
  name: string;
  category: string;
  matched: boolean;
  source: 'openfoodfacts';
}

const SEARCH = 'https://world.openfoodfacts.org/cgi/search.pl';

// Map OFF category tags to our internal shelf-life categories (best effort).
function mapCategory(tags: string[]): string {
  const t = tags.join(' ').toLowerCase();
  // Dairy / eggs
  if (/yogurt|yoghurt/.test(t)) return 'yogurt';
  if (/cheese/.test(t)) return 'cheese-hard';
  if (/\bbutter\b|margarine/.test(t) && !/peanut|nut/.test(t)) return 'butter';
  if (/cream/.test(t)) return 'cream';
  if (/\bmilk|dairy-drinks/.test(t)) return 'milk';
  if (/dairy/.test(t)) return 'dairy';
  if (/egg/.test(t)) return 'eggs';
  if (/tofu|tempeh/.test(t)) return 'tofu';
  // Meat / fish
  if (/bacon/.test(t)) return 'bacon';
  if (/sausage/.test(t)) return 'sausage-raw';
  if (/deli|ham|cold-cut|charcuterie/.test(t)) return 'deli-meat';
  if (/poultry|chicken|turkey/.test(t)) return 'poultry-raw';
  if (/fish|seafood|shrimp|prawn/.test(t)) return 'fish-raw';
  if (/meat|beef|pork|lamb/.test(t)) return 'meat-raw';
  // Spreads / pantry staples (check before generic fruit/veg)
  if (/peanut-butter|nut-butter|hazelnut|chocolate-spread|spread/.test(t)) return 'peanut-butter';
  if (/honey|jam|jelly|preserve|marmalade/.test(t)) return 'jam';
  if (/\boil\b|olive-oil/.test(t)) return 'oil';
  if (/coffee/.test(t)) return 'coffee';
  if (/cereal|granola|oat/.test(t)) return 'cereal';
  if (/pasta|spaghetti|noodle/.test(t)) return 'pasta-dry';
  if (/\brice\b/.test(t)) return 'rice';
  if (/flour/.test(t)) return 'flour';
  if (/sugar|sweetener|salt/.test(t)) return 'sugar';
  if (/snack|cracker|chip|biscuit|cookie/.test(t)) return 'dry-goods';
  // Bakery / produce
  if (/bread|bakery|tortilla/.test(t)) return 'bread';
  if (/berr/.test(t)) return 'fruit-berries';
  if (/citrus|orange|lemon|lime/.test(t)) return 'fruit-citrus';
  if (/fruit/.test(t)) return 'fruit';
  if (/leaf|salad|spinach|lettuce/.test(t)) return 'vegetables-leafy';
  if (/vegetable/.test(t)) return 'vegetables';
  // Drinks / shelf-stable
  if (/water/.test(t)) return 'water';
  if (/soda|cola|soft-drink/.test(t)) return 'soda';
  if (/juice/.test(t)) return 'juice';
  if (/beer|ale|lager/.test(t)) return 'beer';
  if (/wine/.test(t)) return 'wine';
  if (/beverage|drink/.test(t)) return 'beverages';
  if (/canned|tinned/.test(t)) return 'canned';
  if (/sauce|condiment|ketchup|mustard|mayonnaise/.test(t)) return 'condiments';
  return 'default';
}

export async function lookupProduct(name: string): Promise<ProductInfo> {
  const q = name.trim();
  if (!q) return { name, category: 'default', matched: false, source: 'openfoodfacts' };

  return cached(`off:${q.toLowerCase()}`, TTL.product, async () => {
    const url = `${SEARCH}?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=1&fields=product_name,categories_tags`;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'PantrySnap/0.1 (data-layer)' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`OFF ${res.status}`);
      const data = (await res.json()) as {
        products?: { product_name?: string; categories_tags?: string[] }[];
      };
      const p = data.products?.[0];
      if (!p) return { name: q, category: 'default', matched: false, source: 'openfoodfacts' as const };
      return {
        name: p.product_name || q,
        category: mapCategory(p.categories_tags ?? []),
        matched: true,
        source: 'openfoodfacts' as const,
      };
    } catch {
      // Network/timeout — degrade gracefully, frontend still works.
      return { name: q, category: 'default', matched: false, source: 'openfoodfacts' as const };
    }
  });
}
