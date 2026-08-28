import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';
import PhotoThumb from '../components/PhotoThumb';
import StatusBadge from '../components/StatusBadge';
import QtyBar from '../components/QtyBar';
import { expiryStatus } from '../lib/expiry';
import { fadeUp, springSnappy, staggerFast } from '../lib/motion';

export default function Items() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<string>('all');
  const items = useLiveQuery(() => db.items.orderBy('name').toArray(), []);
  const loading = items === undefined;

  const categories = ['all', ...Array.from(new Set((items ?? []).map((i) => i.category))).sort()];
  const filtered = items?.filter(
    (i) =>
      i.name.toLowerCase().includes(query.toLowerCase()) && (cat === 'all' || i.category === cat),
  );

  return (
    <div>
      <TopBar title="Food Radar Items" />
      <main className="max-w-2xl mx-auto px-5 pt-3 pb-28">
        <div className="flex items-center gap-2 mb-3.5">
          <div className="flex-1 flex items-center gap-2 bg-white/90 backdrop-blur-md border-2 border-white rounded-2xl px-4 py-2.5 shadow-[0_4px_0_rgba(186,230,253,0.7)] focus-within:border-red-400 transition-colors">
            <Icon name="search" className="text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pantry radar items…"
              aria-label="Search items"
              className="flex-1 bg-transparent outline-none text-xs sm:text-sm font-bold text-slate-800"
            />
          </div>
          <Link
            to="/items/new"
            aria-label="Add item"
            className="btn-meatball w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md"
          >
            <Icon name="add" className="text-2xl" />
          </Link>
        </div>

        {categories.length > 2 && (
          <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 relative">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`relative shrink-0 text-xs font-black rounded-2xl px-3.5 py-1.5 capitalize z-0 ${
                  cat === c
                    ? 'text-white shadow-xs'
                    : 'bg-white/80 border-2 border-white text-slate-700 shadow-2xs hover:border-sky-200'
                }`}
              >
                {cat === c && (
                  <motion.span
                    layoutId="itemsChip"
                    className="absolute inset-0 rounded-2xl bg-primary -z-10"
                    transition={springSnappy}
                  />
                )}
                <span className="relative z-10">{c === 'all' ? '🌈 All Items' : c}</span>
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-2.5" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-22 w-full" />
            ))}
          </div>
        ) : !filtered || filtered.length === 0 ? (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border-2 border-white text-center mt-4 shadow-[0_6px_0_rgba(186,230,253,0.7)]"
          >
            <span className="text-4xl inline-block mb-2 animate-bounce">🥫</span>
            <p className="text-sm font-extrabold text-slate-700">No items found on radar. Tap + to add one!</p>
          </motion.div>
        ) : (
          <motion.div
            className="flex flex-col gap-3"
            variants={staggerFast}
            initial="hidden"
            animate="show"
            layout
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((item) => (
                <motion.div key={item.id} variants={fadeUp} layout exit={{ opacity: 0, x: -24 }}>
                  <Link
                    to={`/items/${item.id}/edit`}
                    className="bg-white/90 backdrop-blur-md border-2 border-white rounded-3xl p-4 shadow-[0_6px_0_rgba(186,230,253,0.7),0_10px_20px_rgba(15,23,42,0.05)] flex items-center gap-3.5"
                  >
                    <PhotoThumb blob={item.photoBlob} alt={item.name} className="w-16 h-16 rounded-2xl border-2 border-white shadow-xs flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <h3 className="text-sm font-black text-slate-800 truncate">{item.name}</h3>
                        <StatusBadge status={expiryStatus(item.expiryDate)} dateIso={item.expiryDate} />
                      </div>
                      <QtyBar pct={item.quantityPct} lowThreshold={item.lowStockThresholdPct} />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}
