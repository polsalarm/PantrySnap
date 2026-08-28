import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type ShelfId } from '../lib/db';
import Icon from '../components/Icon';
import PhotoThumb from '../components/PhotoThumb';
import StatusBadge from '../components/StatusBadge';
import QtyBar from '../components/QtyBar';
import { expiryStatus } from '../lib/expiry';
import { fadeUp, staggerGrid } from '../lib/motion';

export default function ShelfDetail() {
  const { shelfId } = useParams<{ shelfId: ShelfId }>();
  const navigate = useNavigate();
  const shelf = useLiveQuery(() => db.shelves.get(shelfId as ShelfId), [shelfId]);
  const items = useLiveQuery(
    () => db.items.where('shelfId').equals(shelfId as ShelfId).toArray(),
    [shelfId],
  );

  if (!shelf) return null;

  return (
    <div>
      <header className="bg-sky-100/90 backdrop-blur-md flex items-center justify-between w-full px-5 py-3.5 max-w-2xl mx-auto sticky top-0 z-40 border-b-2 border-white shadow-xs">
        <div className="flex items-center gap-2.5">
          <button onClick={() => navigate(-1)} className="grid size-9 place-items-center bg-white border-2 border-sky-200 rounded-xl text-slate-800 hover:border-red-400 shadow-2xs transition-all active:scale-95">
            <Icon name="arrow_back" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800 leading-tight">{shelf.name}</h1>
            <span className="text-[10px] font-black text-sky-800 uppercase tracking-wider">
              {items?.length ?? 0} ITEMS ON SHELF
            </span>
          </div>
        </div>
        <Link to="/items/new" className="btn-meatball px-3 py-1.5 rounded-xl text-xs font-black shadow-xs flex items-center gap-1">
          <Icon name="add" className="text-base" />
          <span>Add</span>
        </Link>
      </header>
      <main className="max-w-2xl mx-auto px-5 pt-4 pb-28">
        {!items || items.length === 0 ? (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border-2 border-white text-center mt-4 shadow-[0_6px_0_rgba(186,230,253,0.7)] flex flex-col items-center"
          >
            <div className="p-3 bg-amber-50 rounded-2xl border-2 border-amber-200 shadow-2xs mb-2">
              <PhotoThumb alt={shelf.name} className="w-16 h-16 rounded-xl" />
            </div>
            <p className="text-sm font-extrabold text-slate-700">No items on this shelf yet.</p>
            <Link to="/items/new" className="btn-meatball px-5 py-2.5 rounded-2xl text-xs font-black shadow-md inline-block mt-3">
              + Snap Food Item Here
            </Link>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-2 gap-3.5"
            variants={staggerGrid}
            initial="hidden"
            animate="show"
          >
            {items.map((item) => (
              <motion.div key={item.id} variants={fadeUp} whileHover={{ y: -3 }}>
                <Link
                  to={`/items/${item.id}/edit`}
                  className="bg-white/90 backdrop-blur-md border-2 border-white rounded-3xl p-3.5 shadow-[0_6px_0_rgba(186,230,253,0.7),0_10px_20px_rgba(15,23,42,0.05)] flex flex-col gap-2"
                >
                  <PhotoThumb blob={item.photoBlob} alt={item.name} className="w-full h-28 rounded-2xl border-2 border-white shadow-xs object-cover" />
                  <div className="flex justify-between items-start gap-1">
                    <h3 className="text-xs sm:text-sm font-black text-slate-800 leading-tight truncate">{item.name}</h3>
                    <StatusBadge status={expiryStatus(item.expiryDate)} dateIso={item.expiryDate} />
                  </div>
                  <QtyBar pct={item.quantityPct} lowThreshold={item.lowStockThresholdPct} />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
