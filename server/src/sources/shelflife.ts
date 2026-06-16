// USDA FoodKeeper shelf-life lookup (bundled, offline — no network).
import data from '../data/foodkeeper.json' with { type: 'json' };

export type Storage = 'fridge' | 'freezer' | 'pantry';

const categories = data.categories as Record<string, Record<Storage, number>>;
const aliases = data.aliases as Record<string, string>;

export interface ShelfLife {
  category: string;
  storage: Storage;
  days: number;
  source: 'foodkeeper';
  matched: boolean;
}

function resolveCategory(input: string): { key: string; matched: boolean } {
  const q = input.trim().toLowerCase();
  if (categories[q]) return { key: q, matched: true };
  if (aliases[q] && categories[aliases[q]!]) return { key: aliases[q]!, matched: true };
  // loose contains match
  for (const key of Object.keys(categories)) {
    if (key === 'default') continue;
    if (q.includes(key) || key.includes(q)) return { key, matched: true };
  }
  return { key: 'default', matched: false };
}

export function getShelfLife(categoryInput: string, storage: Storage): ShelfLife {
  const { key, matched } = resolveCategory(categoryInput);
  const row = categories[key] ?? categories['default']!;
  let days = row[storage] ?? 0;
  // 0 means "not applicable for this storage" — fall back to fridge, then default
  if (days <= 0) days = row.fridge || categories['default']![storage] || 7;
  return { category: key, storage, days, source: 'foodkeeper', matched };
}
