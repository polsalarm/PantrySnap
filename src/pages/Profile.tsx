import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { computeStats } from '../lib/cooklog';
import { useAuth } from '../lib/useAuth';
import { ChevronRight, Bell, MessageCircle, Receipt, CloudCog } from 'lucide-react';
import { fadeUp, springSoft, staggerFast } from '../lib/motion';
import Mascot from '../components/Mascot';

function CountUp({
  value,
  suffix = '',
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
}) {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) =>
    `${decimals > 0 ? v.toFixed(decimals) : Math.round(v)}${suffix}`,
  );
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.8, ease: [0.22, 1, 0.36, 1] });
    return controls.stop;
  }, [mv, value]);
  return <motion.span>{display}</motion.span>;
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
      Icon: Bell,
      title: 'Expiry alerts',
      meta: 'Items that need using up',
    },
    {
      to: '/chat',
      Icon: MessageCircle,
      title: 'Steve assistant',
      meta: 'Ask what you can cook',
    },
    {
      to: '/items',
      Icon: Receipt,
      title: 'All items',
      meta: `${savedCount} saved recipe${savedCount === 1 ? '' : 's'}`,
    },
    {
      to: '/account',
      Icon: CloudCog,
      title: 'Account & sync',
      meta: auth.signedIn ? 'Signed in' : 'Not signed in',
    },
  ];

  return (
    <main className="max-w-md mx-auto px-5 pt-6 pb-40">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="card-plate card-plate-lg p-5 flex items-center gap-3.5 mb-5"
        style={{ background: 'var(--color-tint-breakfast)' }}
      >
        <div className="emoji-well size-16 overflow-hidden border-0 bg-transparent">
          <Mascot size={56} bob={false} />
        </div>
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
      </motion.div>

      <motion.div
        className="grid grid-cols-3 gap-3 mb-5"
        variants={staggerFast}
        initial="hidden"
        animate="show"
      >
        {[
          { value: stats.mealsCooked, label: 'meals cooked', suffix: '', decimals: 0 },
          { value: stats.itemsRescued, label: 'items rescued', suffix: '', decimals: 0 },
          { value: stats.wasteAvoidedKg, label: 'waste avoided (est.)', suffix: ' kg', decimals: 1 },
        ].map((s) => (
          <motion.div
            key={s.label}
            variants={fadeUp}
            className="card-plate px-2.5 py-3.5 text-center"
            style={{ background: '#E4EFF8' }}
          >
            <div className="text-[19px] font-extrabold text-ink">
              <CountUp value={s.value} suffix={s.suffix} decimals={s.decimals} />
            </div>
            <div className="text-[10.5px] font-extrabold text-ink-soft mt-1 leading-tight uppercase tracking-[0.4px]">
              {s.label}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {stats.mealsCooked === 0 && (
        <p className="text-xs font-semibold text-ink-soft mb-5 leading-relaxed">
          Tap <span className="font-extrabold text-ink">Cooked it</span> on a recipe to start
          tracking. Waste avoided is estimated at 0.25&nbsp;kg per rescued item.
        </p>
      )}

      <motion.div
        className="flex flex-col gap-3.5"
        variants={staggerFast}
        initial="hidden"
        animate="show"
      >
        {rows.map((row) => (
          <motion.div key={row.to} variants={fadeUp} whileHover={{ x: 4 }} transition={springSoft}>
            <Link
              to={row.to}
              className="card-plate p-3.5 flex items-center gap-3 no-underline"
              style={{ background: '#F1F0EC' }}
            >
              <div className="emoji-well size-12 text-ink">
                <row.Icon size={20} strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14.5px] font-bold text-ink">{row.title}</div>
                <div className="text-[11.5px] font-bold text-ink-soft mt-0.5">{row.meta}</div>
              </div>
              <ChevronRight size={16} strokeWidth={2.5} className="shrink-0 text-ink-soft" />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </main>
  );
}
