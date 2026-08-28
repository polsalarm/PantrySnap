import Dexie, { type EntityTable } from 'dexie';

export type ShelfId = 'freezer' | 'top' | 'middle' | 'bottom' | 'crisper' | 'door' | 'pantry';

export type ExpirySource = 'manual' | 'estimated';

export interface Item {
  id?: number;
  uid?: string; // stable cross-device id for cloud sync (Phase 8)
  name: string;
  category: string;
  shelfId: ShelfId;
  photoBlob?: Blob;
  quantityPct: number;
  purchaseDate: string; // ISO date (yyyy-mm-dd)
  expiryDate: string; // ISO date (yyyy-mm-dd)
  expirySource: ExpirySource;
  conditionNotes?: string;
  lowStockThresholdPct: number;
  createdAt: number;
  updatedAt: number;
}

/** One recorded cook. Drives the Profile tab's lifetime stats. */
export interface CookEntry {
  id?: number;
  recipeId: string;
  recipeTitle: string;
  /** Names of on-hand items the recipe consumed, for the "rescued" tally. */
  itemsUsed: string[];
  /** How many of those were already past/near expiry when cooked. */
  rescuedCount: number;
  cookedAt: number;
}

export interface Shelf {
  id: ShelfId;
  name: string;
  icon: string;
  order: number;
}

export const db = new Dexie('pantrysnap') as Dexie & {
  items: EntityTable<Item, 'id'>;
  shelves: EntityTable<Shelf, 'id'>;
  cookLog: EntityTable<CookEntry, 'id'>;
};

db.version(1).stores({
  items: '++id, shelfId, category, expiryDate, name',
  shelves: 'id, order',
});

// v2: add `uid` (stable id for cloud sync). Backfill existing rows.
db.version(2)
  .stores({
    items: '++id, &uid, shelfId, category, expiryDate, name',
    shelves: 'id, order',
  })
  .upgrade(async (tx) => {
    await tx
      .table('items')
      .toCollection()
      .modify((item: Item) => {
        if (!item.uid) item.uid = crypto.randomUUID();
      });
  });

// v3: add the freezer shelf and the cook log behind the Profile stats.
db.version(3)
  .stores({
    items: '++id, &uid, shelfId, category, expiryDate, name',
    shelves: 'id, order',
    cookLog: '++id, recipeId, cookedAt',
  })
  .upgrade(async (tx) => {
    const shelves = tx.table('shelves');
    if (!(await shelves.get('freezer'))) {
      await shelves.add({ id: 'freezer', name: 'Freezer', icon: 'ac_unit', order: -1 });
    }
  });

/** Ensure an item has a stable uid (call before add). */
export function withUid<T extends Partial<Item>>(item: T): T & { uid: string } {
  return { ...item, uid: item.uid ?? crypto.randomUUID() };
}

export const SHELF_SEED: Shelf[] = [
  { id: 'freezer', name: 'Freezer', icon: 'ac_unit', order: -1 },
  { id: 'top', name: 'Top Shelf', icon: 'kitchen', order: 0 },
  { id: 'middle', name: 'Middle Shelf', icon: 'kitchen', order: 1 },
  { id: 'bottom', name: 'Bottom Shelf', icon: 'kitchen', order: 2 },
  { id: 'crisper', name: 'Crisper', icon: 'grass', order: 3 },
  { id: 'door', name: 'Door', icon: 'door_front', order: 4 },
  { id: 'pantry', name: 'Pantry', icon: 'shelves', order: 5 },
];

export async function ensureShelvesSeeded() {
  const count = await db.shelves.count();
  if (count === 0) {
    await db.shelves.bulkAdd(SHELF_SEED);
  }
}

/** Local calendar date, `days` from today. Avoids UTC off-by-one vs `toISOString()`. */
function isoOffset(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Demo fridge stock. Names include the `RECIPE_SEED` keywords so Home can
 * show complete meals; expiry offsets match Fridge Home.dc.html accents.
 */
export const ITEM_SEED: Array<{
  name: string;
  category: string;
  shelfId: ShelfId;
  daysUntilExpiry: number;
}> = [
  { name: 'Ice cream', category: 'frozen', shelfId: 'freezer', daysUntilExpiry: 30 },
  { name: 'Dumplings', category: 'frozen', shelfId: 'freezer', daysUntilExpiry: 25 },
  { name: 'Peas', category: 'frozen', shelfId: 'freezer', daysUntilExpiry: 40 },
  { name: 'Garlic', category: 'produce', shelfId: 'crisper', daysUntilExpiry: 2 },
  { name: 'Spinach leafy greens', category: 'produce', shelfId: 'crisper', daysUntilExpiry: 1 },
  { name: 'Carrots', category: 'produce', shelfId: 'crisper', daysUntilExpiry: 3 },
  { name: 'Bell pepper', category: 'produce', shelfId: 'crisper', daysUntilExpiry: 4 },
  { name: 'Onion', category: 'produce', shelfId: 'crisper', daysUntilExpiry: 6 },
  { name: 'Broccoli', category: 'produce', shelfId: 'crisper', daysUntilExpiry: 5 },
  { name: 'Potatoes', category: 'produce', shelfId: 'bottom', daysUntilExpiry: 2 },
  { name: 'Berry fruit', category: 'produce', shelfId: 'crisper', daysUntilExpiry: 6 },
  { name: 'Butter', category: 'dairy', shelfId: 'door', daysUntilExpiry: 18 },
  { name: 'Eggs', category: 'dairy', shelfId: 'door', daysUntilExpiry: 12 },
  { name: 'Milk', category: 'dairy', shelfId: 'door', daysUntilExpiry: 7 },
  { name: 'Swiss cheese', category: 'dairy', shelfId: 'door', daysUntilExpiry: 9 },
  { name: 'Yogurt', category: 'dairy', shelfId: 'top', daysUntilExpiry: 8 },
  { name: 'Chicken', category: 'meat', shelfId: 'bottom', daysUntilExpiry: 4 },
  { name: 'Turkey deli meat', category: 'meat', shelfId: 'middle', daysUntilExpiry: 5 },
  { name: 'Rice', category: 'pantry', shelfId: 'pantry', daysUntilExpiry: 90 },
  { name: 'Pasta', category: 'pantry', shelfId: 'pantry', daysUntilExpiry: 180 },
  { name: 'Bread', category: 'bakery', shelfId: 'middle', daysUntilExpiry: 4 },
  { name: 'Soy sauce', category: 'condiments', shelfId: 'pantry', daysUntilExpiry: 180 },
  { name: 'Mayo condiment', category: 'condiments', shelfId: 'door', daysUntilExpiry: 40 },
  { name: 'Honey', category: 'pantry', shelfId: 'pantry', daysUntilExpiry: 365 },
  { name: 'Broth', category: 'pantry', shelfId: 'pantry', daysUntilExpiry: 14 },
  { name: 'Leftovers', category: 'leftovers', shelfId: 'middle', daysUntilExpiry: 2 },
];

const ITEM_SEED_FLAG = 'pantrysnap.itemSeed.v1';

/** Fill IndexedDB with demo stock once, skipping names already on hand. */
export async function ensureItemsSeeded() {
  if (localStorage.getItem(ITEM_SEED_FLAG)) return;

  const existing = await db.items.toArray();
  const have = new Set(existing.map((i) => i.name.toLowerCase().trim()));
  const now = Date.now();
  const rows = ITEM_SEED.filter((s) => !have.has(s.name.toLowerCase())).map((s) =>
    withUid({
      name: s.name,
      category: s.category,
      shelfId: s.shelfId,
      quantityPct: 80,
      purchaseDate: isoOffset(-3),
      expiryDate: isoOffset(s.daysUntilExpiry),
      expirySource: 'estimated' as const,
      lowStockThresholdPct: 20,
      createdAt: now,
      updatedAt: now,
    }),
  );

  if (rows.length > 0) await db.items.bulkAdd(rows);
  localStorage.setItem(ITEM_SEED_FLAG, '1');
}
