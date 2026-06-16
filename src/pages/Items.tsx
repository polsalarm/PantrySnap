import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';
import PhotoThumb from '../components/PhotoThumb';
import StatusBadge from '../components/StatusBadge';
import QtyBar from '../components/QtyBar';
import { expiryStatus } from '../lib/expiry';

export default function Items() {
  const [query, setQuery] = useState('');
  const items = useLiveQuery(() => db.items.orderBy('name').toArray(), []);

  const filtered = items?.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <TopBar title="Items" />
      <main className="max-w-2xl mx-auto px-5 pt-2 pb-28">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-2">
            <Icon name="search" className="text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items…"
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
          <Link
            to="/items/new"
            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0"
          >
            <Icon name="add" />
          </Link>
        </div>

        {!filtered || filtered.length === 0 ? (
          <p className="text-text-muted text-center mt-8">No items found. Tap + to add one.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((item) => (
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
