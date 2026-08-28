import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Item } from '../lib/db';
import { daysUntil } from '../lib/expiry';
import ItemIcon, { itemIconKeyForShelf } from '../components/ItemIcon';
import { fadeUp, springSoft, staggerFast } from '../lib/motion';

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
  if (days <= 2) return { label: `${days} day${days === 1 ? '' : 's'}`, color: '#B31E1E' };
  if (days <= 5) return { label: `${days} days`, color: '#B45309' };
  return { label: `${days} days`, color: '#475569' };
}

function chunk<T>(list: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

function ItemSlot({ item, size }: { item: Item; size: number }) {
  const { label, color } = expiryDisplay(item);
  return (
    <motion.div variants={fadeUp}>
      <Link
        to={`/items/${item.id}/edit`}
        className="flex flex-col items-center text-center gap-1.5 no-underline"
      >
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="rounded-full grid place-items-center"
          style={{ width: size, height: size, background: tintFor(item.category) }}
        >
          <ItemIcon
            iconKey={itemIconKeyForShelf(item.name, item.category, item.shelfId)}
            size={Math.round(size * 0.5)}
          />
        </motion.div>
        <div className="text-[12px] font-bold text-ink leading-tight min-h-[30px] flex items-center">
          {item.name}
        </div>
        <div className="text-[10.5px] font-bold" style={{ color }}>
          {label}
        </div>
      </Link>
    </motion.div>
  );
}

function Shelf({ items }: { items: Item[] }) {
  return (
    <>
      <div className="h-[5px] rounded-sm bg-[#C9DBE9]" />
      <motion.div
        className="grid grid-cols-3 gap-x-2.5 gap-y-4 mt-3 mb-5"
        variants={staggerFast}
        initial="hidden"
        animate="show"
      >
        {items.map((item) => (
          <ItemSlot key={item.id} item={item} size={54} />
        ))}
      </motion.div>
    </>
  );
}

export default function FridgeView() {
  const items = useLiveQuery(() => db.items.toArray(), []);

  const freezer = (items ?? []).filter((i) => i.shelfId === 'freezer');
  const fridge = (items ?? []).filter((i) => i.shelfId !== 'freezer');
  const expiringCount = (items ?? []).filter(
    (i) => i.expiryDate && daysUntil(i.expiryDate) <= 3,
  ).length;

  return (
    <main className="max-w-md mx-auto px-5 pt-6 pb-40">
      <motion.div
        className="mb-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springSoft}
      >
        <h2 className="text-[29px] font-extrabold text-ink tracking-[-0.5px]">Your fridge</h2>
        <p className="text-sm font-medium text-ink/60 mt-1.5 leading-snug">
          {items === undefined
            ? 'Loading…'
            : `${items.length} item${items.length === 1 ? '' : 's'} in storage · ${expiringCount} need using up`}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...springSoft, delay: 0.05 }}
        className="relative mx-1 mb-6 bg-white border-2 border-ink rounded-t-[28px] rounded-b-[14px] shadow-[4px_4px_0_var(--color-ink)] overflow-hidden"
      >
        <div className="absolute inset-2 border-[1.5px] border-ink/10 rounded-[20px] pointer-events-none" />

        <div className="relative px-5 pt-[18px] pb-4" style={{ background: 'var(--color-tint-cool)' }}>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-[10.5px] font-extrabold text-[#245D89] uppercase tracking-[0.7px]">
              Freezer
            </span>
            <span className="text-[10px] font-extrabold text-[#245D89]">−18°C</span>
          </div>
          <div className="absolute top-3.5 right-[11px] w-1.5 h-[64%] min-h-[34px] rounded-sm bg-ink" />
          {freezer.length > 0 ? (
            <motion.div
              className="grid grid-cols-3 gap-x-2.5 gap-y-3.5 pr-3.5"
              variants={staggerFast}
              initial="hidden"
              animate="show"
            >
              {freezer.map((item) => (
                <ItemSlot key={item.id} item={item} size={48} />
              ))}
            </motion.div>
          ) : (
            <p className="text-[11.5px] font-semibold text-[#245D89]/70 pr-3.5 pb-1">
              Nothing in the freezer yet.
            </p>
          )}
        </div>

        <div className="h-[5px] bg-ink" />

        <div className="relative px-5 pt-5 pb-[22px]">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-[10.5px] font-extrabold text-ink-soft uppercase tracking-[0.7px]">
              Fridge
            </span>
            <span className="text-[10px] font-extrabold text-ink-soft">4°C</span>
          </div>
          <div className="absolute top-4 right-[11px] w-1.5 h-[80%] rounded-sm bg-ink" />

          <div className="pr-3.5">
            {fridge.length > 0 ? (
              chunk(fridge, 3).map((row, i) => <Shelf key={i} items={row} />)
            ) : (
              <>
                <div className="h-[5px] rounded-sm bg-[#C9DBE9]" />
                <p className="text-[11.5px] font-semibold text-ink-soft/80 mt-3 mb-5">
                  Nothing stored yet.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="h-[9px] bg-ink" />
      </motion.div>
    </main>
  );
}
