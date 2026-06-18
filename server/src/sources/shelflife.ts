// USDA FoodKeeper shelf-life lookup (bundled, offline — no network).
// Data is a list of structured records: each has a category, aliases, a source,
// and per-storage {min,max,notes} ranges in days. See data/foodkeeper.json.
import data from '../data/foodkeeper.json' with { type: 'json' };

export type Storage = 'fridge' | 'freezer' | 'pantry';

interface Range {
  min: number;
  max: number;
  notes?: string;
}
interface FkRecord {
  category: string;
  aliases: string[];
  source: string;
  storage: Partial<Record<Storage, Range | null>>;
}

const records = (data.records as FkRecord[]).filter((r) => r.category);
const byCategory = new Map<string, FkRecord>(records.map((r) => [r.category, r]));
const aliasMap = new Map<string, string>();
for (const r of records) {
  for (const a of r.aliases) aliasMap.set(a.toLowerCase(), r.category);
}
const DEFAULT = byCategory.get('default')!;

export interface ShelfLife {
  category: string;
  storage: Storage;
  days: number; // baseline = max of the range
  minDays: number;
  maxDays: number;
  notes?: string;
  source: string;
  matched: boolean;
}

function resolveRecord(input: string): { rec: FkRecord; matched: boolean } {
  const q = input.trim().toLowerCase();
  const direct = byCategory.get(q);
  if (direct) return { rec: direct, matched: true };
  const alias = aliasMap.get(q);
  if (alias) return { rec: byCategory.get(alias)!, matched: true };
  // loose contains match against category keys and aliases
  for (const r of records) {
    if (r.category === 'default') continue;
    if (q.includes(r.category) || r.category.includes(q)) return { rec: r, matched: true };
    if (r.aliases.some((a) => q.includes(a) || a.includes(q))) return { rec: r, matched: true };
  }
  return { rec: DEFAULT, matched: false };
}

// Pick the range for a storage slot; fall back fridge -> default when N/A.
function rangeFor(rec: FkRecord, storage: Storage): Range {
  const direct = rec.storage[storage];
  if (direct) return direct;
  const fridge = rec.storage.fridge;
  if (fridge) return fridge;
  return DEFAULT.storage[storage] ?? { min: 7, max: 7 };
}

export function getShelfLife(categoryInput: string, storage: Storage): ShelfLife {
  const { rec, matched } = resolveRecord(categoryInput);
  const range = rangeFor(rec, storage);
  return {
    category: rec.category,
    storage,
    days: range.max,
    minDays: range.min,
    maxDays: range.max,
    notes: range.notes,
    source: rec.source,
    matched,
  };
}
