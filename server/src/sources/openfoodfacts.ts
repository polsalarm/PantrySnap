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
  if (/\bmilk|dairy-drinks/.test(t)) return 'milk';
  if (/cheese/.test(t)) return 'cheese-hard';
  if (/yogurt|yoghurt/.test(t)) return 'yogurt';
  if (/dairy/.test(t)) return 'dairy';
  if (/egg/.test(t)) return 'eggs';
  if (/poultry|chicken/.test(t)) return 'poultry-raw';
  if (/fish|seafood/.test(t)) return 'fish-raw';
  if (/meat|beef|pork/.test(t)) return 'meat-raw';
  if (/bread|bakery/.test(t)) return 'bread';
  if (/berr/.test(t)) return 'fruit-berries';
  if (/citrus|orange|lemon/.test(t)) return 'fruit-citrus';
  if (/fruit/.test(t)) return 'fruit';
  if (/leaf|salad|spinach|lettuce/.test(t)) return 'vegetables-leafy';
  if (/vegetable/.test(t)) return 'vegetables';
  if (/beverage|drink|juice|soda/.test(t)) return 'beverages';
  if (/canned|tinned/.test(t)) return 'canned';
  if (/sauce|condiment|ketchup/.test(t)) return 'condiments';
  if (/pasta|rice|cereal|flour/.test(t)) return 'dry-goods';
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
