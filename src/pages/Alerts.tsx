import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Bell, ChevronRight, CircleCheck } from 'lucide-react';
import { db, type Item } from '../lib/db';
import { daysUntil, expiryStatus } from '../lib/expiry';
import { requestNotificationPermission } from '../lib/notifications';
import ItemIcon, { itemIconKeyForShelf } from '../components/ItemIcon';
import PhotoThumb from '../components/PhotoThumb';
import { fadeUp, springSnappy, springSoft } from '../lib/motion';

type Filter = 'all' | 'expiring' | 'low-stock';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'expiring', label: 'Expiring' },
  { id: 'low-stock', label: 'Low stock' },
];

const GROUP_TINT: Record<string, string> = {
  produce: '#DFEBC5',
  dairy: '#F5E7C0',
  meat: '#EADFD6',
  seafood: '#EADFD6',
  bakery: '#F1E7D6',
  pantry: '#DCEAF6',
  frozen: '#DCEAF6',
  beverages: '#DCEAF6',
};

function tintFor(category: string): string {
  return GROUP_TINT[category?.toLowerCase()] ?? '#EFEAE3';
}

function expiryDisplay(item: Item): { label: string; color: string } {
  if (!item.expiryDate) return { label: '—', color: '#475569' };
  const days = daysUntil(item.expiryDate);
  if (days < 0) return { label: 'expired', color: '#B31E1E' };
  if (days === 0) return { label: 'today', color: '#B31E1E' };
  if (days === 1) return { label: '1 day', color: '#B31E1E' };
  if (days === 2) return { label: '2 days', color: '#B31E1E' };
  if (days <= 5) return { label: `${days} days`, color: '#B45309' };
  return { label: `${days} days`, color: '#475569' };
}

function isLow(item: Item): boolean {
  return item.quantityPct <= item.lowStockThresholdPct;
}

function itemsForFilter(filter: Filter, expiring: Item[], lowStock: Item[]): Item[] {
  if (filter === 'expiring') return expiring;
  if (filter === 'low-stock') return lowStock;
  return [...new Set([...expiring, ...lowStock])];
}

function AlertRow({ item }: { item: Item }) {
  const expiry = expiryDisplay(item);
  const low = isLow(item);
  return (
    <Link
      to={`/items/${item.id}/edit`}
      className="card-plate p-3.5 flex items-center gap-3 no-underline"
      style={{ background: '#F1F0EC' }}
    >
      <div
        className="emoji-well size-12 overflow-hidden"
        style={{ background: tintFor(item.category) }}
      >
        {item.photoBlob ? (
          <PhotoThumb blob={item.photoBlob} alt={item.name} className="size-full object-cover" />
        ) : (
          <ItemIcon
            iconKey={itemIconKeyForShelf(item.name, item.category, item.shelfId)}
            size={20}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14.5px] font-bold text-ink truncate">{item.name}</div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] font-bold">
          <span style={{ color: expiry.color }}>{expiry.label}</span>
          {low && (
            <>
              <span className="text-ink/25">·</span>
              <span style={{ color: '#B45309' }}>{item.quantityPct}% left</span>
            </>
          )}
        </div>
      </div>
      <ChevronRight size={16} strokeWidth={2.5} className="shrink-0 text-ink-soft" />
    </Link>
  );
}

export default function Alerts() {
  const [filter, setFilter] = useState<Filter>('all');
  const items = useLiveQuery(() => db.items.toArray(), []);

  const expiring = items?.filter((i) => expiryStatus(i.expiryDate) !== 'fresh') ?? [];
  const lowStock = items?.filter(isLow) ?? [];
  const alertItems = itemsForFilter(filter, expiring, lowStock);
  const subtitle =
    items === undefined
      ? 'Loading…'
      : `${expiring.length} need using up · ${lowStock.length} running low`;

  return (
    <main className="max-w-md mx-auto px-5 pt-6 pb-40">
      <motion.div
        className="flex items-start justify-between gap-3 mb-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springSoft}
      >
        <div className="min-w-0">
          <h2 className="text-[29px] font-extrabold text-ink tracking-[-0.5px]">Expiry alerts</h2>
          <p className="text-sm font-medium text-ink/60 mt-1.5 leading-snug">{subtitle}</p>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={requestNotificationPermission}
          aria-label="Enable expiry notifications"
          className="emoji-well size-11 text-ink shrink-0 mt-0.5"
        >
          <Bell size={18} strokeWidth={1.75} />
        </motion.button>
      </motion.div>

      <div className="flex items-center gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`relative px-3.5 py-2 rounded-full text-[12px] font-extrabold border-2 border-ink z-0 ${
              filter === f.id ? 'text-white' : 'bg-white text-ink'
            }`}
          >
            {filter === f.id && (
              <motion.span
                layoutId="alertsChip"
                className="absolute inset-0 rounded-full bg-ink -z-10"
                transition={springSnappy}
              />
            )}
            <span className="relative z-10">{f.label}</span>
          </button>
        ))}
      </div>

      {alertItems.length === 0 ? (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="card-plate card-plate-lg px-5 py-8 flex flex-col items-center text-center"
          style={{ background: '#E4EFF8' }}
        >
          <div className="emoji-well size-[82px] text-ink">
            <CircleCheck size={34} strokeWidth={1.75} />
          </div>
          <p className="mt-4 text-lg font-extrabold text-ink">Nothing to use up</p>
          <p className="mt-2 text-[13.5px] font-semibold text-ink-soft leading-relaxed max-w-[260px]">
            No items are close to expiry or running low. We&rsquo;ll flag them here as they get close.
          </p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {alertItems.map((item) => (
            <motion.div
              key={item.id}
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <AlertRow item={item} />
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
