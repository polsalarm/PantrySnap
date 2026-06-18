// Phase 8 cloud sync. Last-write-wins (by updatedAt) over a per-user Supabase
// `items` table. Local-first: this is opt-in backup/restore on top of IndexedDB.
//
// Limitations (v1): photos (Blob) are not synced — only item metadata.
// Hard deletes don't propagate (no tombstones yet).
import { getSupabase } from './supabase';
import { db, withUid, type Item } from './db';

// Supabase row shape (snake_case). user_id is filled by the DB default / RLS.
interface Row {
  uid: string;
  name: string;
  category: string;
  shelf_id: string;
  quantity_pct: number;
  purchase_date: string;
  expiry_date: string;
  expiry_source: string;
  condition_notes?: string | null;
  low_stock_threshold_pct: number;
  created_at: number;
  updated_at: number;
}

function toRow(item: Item): Row {
  return {
    uid: item.uid ?? crypto.randomUUID(),
    name: item.name,
    category: item.category,
    shelf_id: item.shelfId,
    quantity_pct: item.quantityPct,
    purchase_date: item.purchaseDate,
    expiry_date: item.expiryDate,
    expiry_source: item.expirySource,
    condition_notes: item.conditionNotes?.trim() || null,
    low_stock_threshold_pct: item.lowStockThresholdPct,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

function fromRow(r: Row): Omit<Item, 'id'> {
  return {
    uid: r.uid,
    name: r.name,
    category: r.category,
    shelfId: r.shelf_id as Item['shelfId'],
    quantityPct: r.quantity_pct,
    purchaseDate: r.purchase_date,
    expiryDate: r.expiry_date,
    expirySource: r.expiry_source as Item['expirySource'],
    conditionNotes: r.condition_notes ?? undefined,
    lowStockThresholdPct: r.low_stock_threshold_pct,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/** Push all local items to the cloud (upsert by uid). Returns count pushed. */
export async function backupToCloud(): Promise<number> {
  const items = await db.items.toArray();
  if (items.length === 0) return 0;
  const rows = items.map(toRow);
  const { error } = await (await getSupabase()).from('items').upsert(rows, { onConflict: 'uid' });
  if (error) throw new Error(error.message);
  return rows.length;
}

/** Pull cloud items and merge into local (last-write-wins). Returns count changed. */
export async function restoreFromCloud(): Promise<number> {
  const { data, error } = await (await getSupabase()).from('items').select('*');
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Row[];
  let changed = 0;

  await db.transaction('rw', db.items, async () => {
    for (const r of rows) {
      const local = await db.items.where('uid').equals(r.uid).first();
      if (!local) {
        await db.items.add(withUid(fromRow(r)));
        changed++;
      } else if (r.updated_at > local.updatedAt) {
        await db.items.update(local.id!, fromRow(r));
        changed++;
      }
    }
  });
  return changed;
}

/** Full two-way sync: restore (pull) then backup (push). */
export async function syncNow(): Promise<{ pulled: number; pushed: number }> {
  const pulled = await restoreFromCloud();
  const pushed = await backupToCloud();
  return { pulled, pushed };
}
