import Dexie, { type EntityTable } from 'dexie';

export type ShelfId = 'top' | 'middle' | 'bottom' | 'crisper' | 'door' | 'pantry';

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

export interface Shelf {
  id: ShelfId;
  name: string;
  icon: string;
  order: number;
}

export const db = new Dexie('pantrysnap') as Dexie & {
  items: EntityTable<Item, 'id'>;
  shelves: EntityTable<Shelf, 'id'>;
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

/** Ensure an item has a stable uid (call before add). */
export function withUid<T extends Partial<Item>>(item: T): T & { uid: string } {
  return { ...item, uid: item.uid ?? crypto.randomUUID() };
}

export const SHELF_SEED: Shelf[] = [
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
