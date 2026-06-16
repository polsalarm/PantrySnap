import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type ShelfId } from '../lib/db';
import Icon from '../components/Icon';
import PhotoThumb from '../components/PhotoThumb';
import StatusBadge from '../components/StatusBadge';
import QtyBar from '../components/QtyBar';
import { expiryStatus } from '../lib/expiry';

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
      <header className="bg-bg flex items-center gap-2 w-full px-5 py-3 max-w-2xl mx-auto sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="text-text">
          <Icon name="arrow_back" />
        </button>
        <h1 className="text-xl font-semibold text-text">{shelf.name}</h1>
      </header>
      <main className="max-w-2xl mx-auto px-5 pt-2 pb-28">
        {!items || items.length === 0 ? (
          <p className="text-text-muted mt-8 text-center">No items on this shelf yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => (
              <Link
                key={item.id}
                to={`/items/${item.id}/edit`}
                className="bg-surface rounded-2xl p-3 card-shadow flex flex-col gap-2"
              >
                <PhotoThumb blob={item.photoBlob} alt={item.name} className="w-full h-28 rounded-xl" />
                <div className="flex justify-between items-start gap-1">
                  <h3 className="text-sm font-semibold text-text leading-tight">{item.name}</h3>
                  <StatusBadge status={expiryStatus(item.expiryDate)} dateIso={item.expiryDate} />
                </div>
                <QtyBar pct={item.quantityPct} lowThreshold={item.lowStockThresholdPct} />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
