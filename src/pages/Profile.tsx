import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { computeStats } from '../lib/cooklog';
import { useAuth } from '../lib/useAuth';

function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" className="shrink-0">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export default function Profile() {
  const auth = useAuth();
  const entries = useLiveQuery(() => db.cookLog.toArray(), []) ?? [];
  const savedCount = (() => {
    try {
      const raw = localStorage.getItem('pantrysnap.saved');
      return raw ? (JSON.parse(raw) as string[]).length : 0;
    } catch {
      return 0;
    }
  })();

  const stats = computeStats(entries);
  const lastCook = entries.length > 0 ? Math.max(...entries.map((e) => e.cookedAt)) : null;

  const rows = [
    {
      to: '/alerts',
      emoji: '🔔',
      title: 'Expiry alerts',
      meta: 'Items that need using up',
    },
    {
      to: '/chat',
      emoji: '💬',
      title: 'Kitchen assistant',
      meta: 'Ask what you can cook',
    },
    {
      to: '/items',
      emoji: '🧾',
      title: 'All items',
      meta: `${savedCount} saved recipe${savedCount === 1 ? '' : 's'}`,
    },
    {
      to: '/account',
      emoji: '☁️',
      title: 'Account & sync',
      meta: auth.signedIn ? 'Signed in' : 'Not signed in',
    },
  ];

  return (
    <main className="max-w-md mx-auto px-5 pt-6 pb-40">
      <div
        className="card-plate card-plate-lg p-5 flex items-center gap-3.5 mb-5"
        style={{ background: 'var(--color-tint-breakfast)' }}
      >
        <div className="emoji-well size-16 text-[30px]">🧑‍🍳</div>
        <div className="min-w-0">
          <h2 className="text-[21px] font-extrabold text-ink tracking-[-0.3px] truncate">
            {auth.signedIn ? 'Your kitchen' : 'Guest cook'}
          </h2>
          <p className="text-[12.5px] font-semibold text-ink/65 mt-0.5">
            {lastCook
              ? `Last cooked ${new Date(lastCook).toLocaleDateString()}`
              : 'No meals logged yet'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { value: String(stats.mealsCooked), label: 'meals cooked' },
          { value: String(stats.itemsRescued), label: 'items rescued' },
          { value: `${stats.wasteAvoidedKg} kg`, label: 'waste avoided (est.)' },
        ].map((s) => (
          <div
            key={s.label}
            className="card-plate px-2.5 py-3.5 text-center"
            style={{ background: '#E4EFF8' }}
          >
            <div className="text-[19px] font-extrabold text-ink">{s.value}</div>
            <div className="text-[10.5px] font-extrabold text-ink-soft mt-1 leading-tight uppercase tracking-[0.4px]">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {stats.mealsCooked === 0 && (
        <p className="text-xs font-semibold text-ink-soft mb-5 leading-relaxed">
          Tap <span className="font-extrabold text-ink">Cooked it</span> on a recipe to start
          tracking. Waste avoided is estimated at 0.25&nbsp;kg per rescued item.
        </p>
      )}

      <div className="flex flex-col gap-3.5">
        {rows.map((row) => (
          <Link
            key={row.to}
            to={row.to}
            className="card-plate p-3.5 flex items-center gap-3 no-underline"
            style={{ background: '#F1F0EC' }}
          >
            <div className="emoji-well size-12 text-[21px]">{row.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[14.5px] font-bold text-ink">{row.title}</div>
              <div className="text-[11.5px] font-bold text-ink-soft mt-0.5">{row.meta}</div>
            </div>
            <Chevron />
          </Link>
        ))}
      </div>
    </main>
  );
}
