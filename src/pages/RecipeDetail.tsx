import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Share2,
  Heart,
  ListChecks,
  CircleCheck,
  CircleDashed,
  Clock,
  ShoppingBag,
} from 'lucide-react';
import { db, type Item } from '../lib/db';
import { expiryLabel, expiryStatus } from '../lib/expiry';
import { type RecipeView, tintFor } from '../lib/recipeview';
import { recordCook } from '../lib/cooklog';
import { useSaved } from '../lib/useRecipeViews';
import DishIcon from '../components/DishIcon';
import { fadeUp, springSoft } from '../lib/motion';

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

/**
 * Per-ingredient item lookup. Kept local rather than added to recipeview.ts's
 * shared matching helpers, which only expose an aggregate have-count — this
 * page needs the actual matched Item (for its real expiry date), which is new
 * logic no other screen needs yet.
 */
function matchItem(ingredient: string, items: Item[]): Item | undefined {
  const needle = normalize(ingredient);
  return items.find((item) => {
    const name = normalize(item.name);
    return needle.includes(name) || name.includes(needle);
  });
}

function IconButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="size-10 rounded-full bg-white/85 backdrop-blur-md border border-white/60 shadow-[0_2px_10px_rgba(30,41,59,0.12)] grid place-items-center text-ink active:scale-90 transition-transform"
    >
      {children}
    </button>
  );
}

function StatColumn({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1 py-3 text-center">
      <div className="text-ink">{icon}</div>
      <div className="text-sm font-extrabold text-ink leading-tight">{value}</div>
      <div className="text-[10.5px] font-bold text-ink-soft leading-tight">{label}</div>
    </div>
  );
}

/** Vertical divider between stat columns. */
function Divider() {
  return <div className="w-px self-stretch my-2 bg-border" />;
}

export default function RecipeDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const recipe = (location.state as { recipe?: RecipeView } | null)?.recipe;

  const items = useLiveQuery(() => db.items.toArray(), []) ?? [];
  const { saved, toggle } = useSaved();
  const [cooked, setCooked] = useState(false);
  const [cookBusy, setCookBusy] = useState(false);

  if (!recipe) {
    return (
      <main className="max-w-md mx-auto px-5 pt-10 pb-40 flex flex-col items-center text-center">
        <p className="text-lg font-extrabold text-ink">Recipe not found</p>
        <p className="mt-2 text-sm font-semibold text-ink-soft max-w-[16rem]">
          This recipe wasn&rsquo;t opened from a card, so there&rsquo;s nothing to show here.
        </p>
        <Link to="/" className="btn-pill mt-5 px-6 py-3 text-sm">
          Back to home
        </Link>
      </main>
    );
  }

  const isSaved = saved.has(recipe.id);
  const matches = recipe.ingredients.map((ingredient) => ({
    ingredient,
    item: matchItem(ingredient, items),
  }));

  async function handleShare() {
    const shareData = { title: recipe!.title, text: `Cook ${recipe!.title} with what's in the fridge.` };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      /* share sheet dismissed — fall through to clipboard */
    }
    try {
      await navigator.clipboard.writeText(recipe!.title);
    } catch {
      /* clipboard unavailable — nothing else to do */
    }
  }

  async function handleCook() {
    setCookBusy(true);
    try {
      await recordCook(recipe!.id, recipe!.title, recipe!.ingredients, items);
      setCooked(true);
    } finally {
      setCookBusy(false);
    }
  }

  const statColumns = [
    {
      icon: <ListChecks size={18} strokeWidth={1.75} />,
      value: String(recipe.ingredientCount),
      label: recipe.ingredientCount === 1 ? 'ingredient' : 'ingredients',
    },
    recipe.mins !== undefined
      ? { icon: <Clock size={18} strokeWidth={1.75} />, value: String(recipe.mins), label: 'minutes' }
      : {
          icon: recipe.ready ? (
            <CircleCheck size={18} strokeWidth={1.75} />
          ) : (
            <CircleDashed size={18} strokeWidth={1.75} />
          ),
          value: recipe.ready ? 'Ready' : `${recipe.haveCount}/${recipe.ingredientCount}`,
          label: recipe.ready ? 'to cook' : 'on hand',
        },
    recipe.serves !== undefined
      ? { icon: <ShoppingBag size={18} strokeWidth={1.75} />, value: String(recipe.serves), label: 'serves' }
      : null,
  ].filter(Boolean) as { icon: React.ReactNode; value: string; label: string }[];

  return (
    <div className="pb-40">
      {/* Header image */}
      <div className="relative w-full h-[42vh] min-h-[280px] overflow-hidden" style={{ background: tintFor(recipe.category) }}>
        {recipe.image ? (
          <img src={recipe.image} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-ink/70">
            <DishIcon iconKey={recipe.iconKey} size={72} strokeWidth={1.25} />
          </div>
        )}

        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+14px)]">
          <IconButton label="Back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} strokeWidth={2.25} />
          </IconButton>
          <div className="flex items-center gap-2.5">
            <IconButton label="Share recipe" onClick={handleShare}>
              <Share2 size={17} strokeWidth={2.25} />
            </IconButton>
            <IconButton label={isSaved ? 'Remove from saved' : 'Save recipe'} onClick={() => toggle(recipe.id)}>
              <Heart
                size={17}
                strokeWidth={2.25}
                fill={isSaved ? '#D92626' : 'none'}
                color={isSaved ? '#D92626' : '#1E293B'}
              />
            </IconButton>
          </div>
        </div>
      </div>

      {/* Sheet */}
      <motion.div
        initial={fadeUp.hidden}
        animate={fadeUp.show}
        className="relative -mt-6 bg-bg rounded-t-[28px] px-5 pt-6"
      >
        <h1 className="text-2xl font-extrabold text-ink leading-tight">{recipe.title}</h1>
        <p className="mt-1.5 text-sm font-semibold text-ink-soft">
          {[recipe.category, recipe.level].filter(Boolean).join(' · ')}
        </p>

        <div className="mt-4 card-plate flex items-stretch">
          {statColumns.map((col, i) => (
            <div key={i} className="flex items-stretch flex-1">
              <StatColumn icon={col.icon} value={col.value} label={col.label} />
              {i < statColumns.length - 1 && <Divider />}
            </div>
          ))}
        </div>

        <div className="border-t border-border-soft mt-5" />

        {/* Ingredients — each flagged against real inventory, with the actual expiry date. */}
        <section className="mt-5">
          <h2 className="text-base font-extrabold text-ink">Ingredients</h2>
          <div className="mt-3 flex flex-col gap-2.5">
            {matches.map(({ ingredient, item }, i) => {
              const status = item?.expiryDate ? expiryStatus(item.expiryDate) : null;
              const color =
                status === 'expired' || status === 'soon' ? '#B31E1E' : 'var(--color-ink-soft)';
              return (
                <div key={i} className="card-shadow rounded-2xl bg-surface px-3.5 py-3 flex items-center gap-3">
                  {item ? (
                    <CircleCheck size={18} strokeWidth={2} className="text-primary shrink-0" />
                  ) : (
                    <ShoppingBag size={17} strokeWidth={1.75} className="text-ink-soft shrink-0" />
                  )}
                  <span className="flex-1 min-w-0 text-sm font-semibold text-ink capitalize truncate">
                    {ingredient}
                  </span>
                  {item?.expiryDate ? (
                    <span className="text-xs font-extrabold shrink-0" style={{ color }}>
                      {expiryLabel(item.expiryDate)}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-ink-soft/70 shrink-0">
                      {item ? 'no expiry set' : 'not in fridge'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </motion.div>

      {/* Cook CTA */}
      <div className="fixed left-0 right-0 bottom-[104px] px-5 z-30">
        <div className="max-w-md mx-auto">
          <motion.button
            onClick={handleCook}
            disabled={cookBusy || cooked}
            whileTap={{ scale: 0.97 }}
            transition={springSoft}
            className="btn-pill w-full py-3.5 text-sm shadow-[0_8px_20px_rgba(0,0,0,0.28)] disabled:opacity-80"
          >
            {cooked ? 'Logged as cooked' : cookBusy ? 'Logging…' : 'Cooked it'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
