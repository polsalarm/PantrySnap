import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import TopBar from '../components/TopBar';
import PhotoThumb from '../components/PhotoThumb';
import StatusBadge from '../components/StatusBadge';
import QtyBar from '../components/QtyBar';
import { expiryStatus } from '../lib/expiry';
import { requestNotificationPermission } from '../lib/notifications';

type Filter = 'all' | 'expiring' | 'low-stock';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'expiring', label: 'Expiring Soon' },
  { id: 'low-stock', label: 'Low Stock' },
];

export default function Alerts() {
  const [filter, setFilter] = useState<Filter>('all');
  const items = useLiveQuery(() => db.items.toArray(), []);

  const expiring = items?.filter((i) => expiryStatus(i.expiryDate) !== 'fresh') ?? [];
  const lowStock = items?.filter((i) => i.quantityPct <= i.lowStockThresholdPct) ?? [];

  const alertItems =
    filter === 'expiring' ? expiring : filter === 'low-stock' ? lowStock : [...new Set([...expiring, ...lowStock])];

  return (
    <div>
      <TopBar title="Kitchen Alerts" />
      <main className="max-w-2xl mx-auto px-5 pt-2 pb-28">
        <div className="flex gap-2 mb-4">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                filter === f.id ? 'bg-primary text-white' : 'bg-surface border border-border text-text-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={requestNotificationPermission}
            className="ml-auto px-3 py-1.5 rounded-full text-sm font-medium bg-surface border border-border text-text-muted"
            title="Enable push notifications"
          >
            🔔
          </button>
        </div>

        {alertItems.length === 0 ? (
          <p className="text-text-muted text-center mt-8">Nothing to flag right now. Nice work!</p>
        ) : (
          <div className="flex flex-col gap-2">
            {alertItems.map((item) => (
              <Link
                key={item.id}
                to={`/items/${item.id}/edit`}
                className="bg-surface rounded-2xl p-3 card-shadow flex items-center gap-3"
              >
                <PhotoThumb blob={item.photoBlob} alt={item.name} className="w-14 h-14 rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-sm font-semibold text-text truncate">{item.name}</h3>
                    <StatusBadge status={expiryStatus(item.expiryDate)} dateIso={item.expiryDate} />
                  </div>
                  <QtyBar pct={item.quantityPct} lowThreshold={item.lowStockThresholdPct} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
