import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';
import PhotoThumb from '../components/PhotoThumb';
import Onboarding from '../components/Onboarding';

export default function FridgeHome() {
  const shelves = useLiveQuery(() => db.shelves.orderBy('order').toArray(), []);
  const items = useLiveQuery(() => db.items.toArray(), []);
  const loading = shelves === undefined;

  return (
    <div>
      <TopBar title="PantrySnap" />
      <main className="max-w-2xl mx-auto px-5 pt-2 pb-28">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-text">Your Fridge</h2>
          <p className="text-text-muted mt-1">Organize. Track. Never waste again.</p>
        </div>

        <Onboarding />

        {loading && (
          <div className="flex flex-col gap-4" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-24 w-full" />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {shelves?.map((shelf) => {
            const shelfItems = items?.filter((i) => i.shelfId === shelf.id) ?? [];
            const visible = shelfItems.slice(0, 3);
            const extra = shelfItems.length - visible.length;

            return (
              <Link
                key={shelf.id}
                to={`/shelf/${shelf.id}`}
                className="animate-in bg-surface rounded-2xl p-4 card-shadow flex flex-col gap-3"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Icon name={shelf.icon} className="text-primary" />
                    <h3 className="text-lg font-semibold text-text">{shelf.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text-muted bg-border-soft px-2 py-1 rounded-full">
                      {shelfItems.length} items
                    </span>
                    <Icon name="chevron_right" className="text-text-muted" />
                  </div>
                </div>

                {shelfItems.length === 0 ? (
                  <p className="text-sm text-text-muted">No items yet — tap to add some.</p>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {visible.map((item) => (
                      <PhotoThumb
                        key={item.id}
                        blob={item.photoBlob}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg flex-shrink-0"
                      />
                    ))}
                    {extra > 0 && (
                      <div className="w-16 h-16 rounded-lg bg-border-soft flex-shrink-0 flex items-center justify-center text-text-muted text-xs font-medium">
                        +{extra}
                      </div>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
