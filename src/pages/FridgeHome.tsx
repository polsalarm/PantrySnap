import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Refrigerator, Sparkles } from 'lucide-react';
import { generateRecipe, aiErrorMessage, type GeneratedRecipe } from '../lib/api';
import type { Item } from '../lib/db';
import { useRecipeViews, useSaved } from '../lib/useRecipeViews';
import { urgentItems, type RecipeView } from '../lib/recipeview';
import RecipeCard, { HeroRecipeCard } from '../components/RecipeCard';
import Mascot from '../components/Mascot';
import {
  fadeScale,
  fadeUp,
  springBouncy,
  springSoft,
  staggerGrid,
  staggerText,
} from '../lib/motion';

function tonightCopy(stockCount: number, readyCount: number, expiringCount: number): string {
  if (stockCount === 0) return 'Add a few staples and meals will appear here.';
  const meals = `${readyCount} ${readyCount === 1 ? 'meal' : 'meals'} from what's already in storage.`;
  if (expiringCount === 0) return meals;
  const urgent =
    expiringCount === 1
      ? '1 ingredient wants using up first.'
      : `${expiringCount} ingredients want using up first.`;
  return `${meals} ${urgent}`;
}

function GenerateFromItems({ items }: { items: Item[] }) {
  const [recipe, setRecipe] = useState<GeneratedRecipe | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const names = items.map((item) => item.name);
      const expiring = urgentItems(items).map((item) => item.name);
      setRecipe(await generateRecipe(names, expiring));
    } catch (err) {
      setError(aiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {items.length > 0 && (
        <motion.div
          className="mb-5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springSoft, delay: 0.05 }}
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={generate}
            disabled={busy}
            className="card-plate w-full py-3.5 px-4 flex items-center justify-center gap-2 text-sm font-bold text-ink disabled:opacity-70"
            style={{ background: 'var(--color-tint-breakfast)' }}
          >
            <Sparkles size={16} strokeWidth={1.75} />
            {busy ? 'Generating a recipe from your items…' : 'Generate a recipe from my items'}
          </motion.button>
        </motion.div>
      )}

      {error && (
        <p className="card-plate px-3.5 py-2.5 mb-5 text-xs font-bold text-[#B31E1E] bg-primary-soft">
          {error}
        </p>
      )}

      <AnimatePresence>
        {recipe && (
          <motion.article
            key={recipe.title}
            initial={{ opacity: 0, height: 0, scale: 0.96 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={springSoft}
            className="card-plate card-plate-lg p-4 mb-5 overflow-hidden"
            style={{ background: '#FFFFFF' }}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={20} strokeWidth={1.75} className="text-ink" />
              <h3 className="text-lg font-extrabold text-ink">{recipe.title}</h3>
            </div>
            {recipe.usesExpiring.length > 0 && (
              <p className="mt-2 text-xs font-extrabold text-[#B31E1E]">
                Rescues: {recipe.usesExpiring.join(', ')}
              </p>
            )}
            <p className="mt-2 text-xs font-semibold text-ink-soft">
              <span className="font-extrabold text-ink">Ingredients:</span>{' '}
              {recipe.ingredients.join(', ')}
            </p>
            <ol className="list-decimal pl-5 mt-3 space-y-1.5 text-xs font-semibold text-ink-soft">
              {recipe.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </motion.article>
        )}
      </AnimatePresence>
    </>
  );
}

export default function FridgeHome() {
  const { items, views, busy, cook } = useRecipeViews(12);
  const { saved, toggle } = useSaved();
  const [justCooked, setJustCooked] = useState<string | null>(null);

  const ready = views.filter((v) => v.ready);
  const hero = ready[0];
  const rest = (hero ? views.filter((v) => v.id !== hero.id) : views).sort(
    (a, b) => Number(b.ready) - Number(a.ready),
  );
  const stockCount = items?.length ?? 0;
  const expiringCount = items ? urgentItems(items).length : 0;

  async function handleCook(recipe: RecipeView) {
    await cook(recipe);
    setJustCooked(recipe.title);
    setTimeout(() => setJustCooked(null), 2400);
  }

  return (
    <main className="max-w-md mx-auto px-5 pt-6 pb-40">
      <motion.div
        variants={staggerText}
        initial="hidden"
        animate="show"
        className="card-plate card-plate-lg px-[18px] pt-[18px] pb-4 mb-5 flex gap-3 items-start"
        style={{ background: 'var(--color-tint-cool)' }}
      >
        <div className="min-w-0 flex-1">
        <motion.div
          variants={fadeUp}
          className="text-[11px] font-extrabold text-[#245D89] uppercase tracking-[1px]"
        >
          Tonight
        </motion.div>
        <motion.h2
          variants={fadeScale}
          className="mt-1.5 text-[30px] font-extrabold text-ink tracking-[-0.6px] leading-[1.1]"
        >
          Ready to cook
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mt-2 text-[13.5px] font-semibold text-ink/70 leading-snug"
        >
          {tonightCopy(stockCount, ready.length, expiringCount)}
        </motion.p>
        </div>
        <motion.div variants={fadeScale} className="shrink-0 -mt-1 -mr-1">
          <Mascot size={72} className="drop-shadow-[0_6px_10px_rgba(0,0,0,0.18)]" />
        </motion.div>
      </motion.div>

      {items && <GenerateFromItems items={items} />}

      {busy && (
        <motion.div
          className="grid grid-cols-2 gap-3.5"
          initial="hidden"
          animate="show"
          variants={staggerGrid}
        >
          {[0, 1, 2, 3].map((i) => (
            <motion.div key={i} variants={fadeUp} className="skeleton h-60" />
          ))}
        </motion.div>
      )}

      {!busy && views.length === 0 && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="card-plate card-plate-lg px-5 py-8 flex flex-col items-center text-center"
          style={{ background: '#E4EFF8' }}
        >
          <motion.div
            className="emoji-well size-[82px] text-ink"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Refrigerator size={34} strokeWidth={1.75} />
          </motion.div>
          <p className="mt-4 text-lg font-extrabold text-ink">No recipes ready yet</p>
          <p className="mt-2 text-[13.5px] font-semibold text-ink-soft leading-relaxed max-w-[260px]">
            Add a few staples to your fridge and we&rsquo;ll match recipes to what you already have.
          </p>
          <Link to="/items/new" className="btn-pill mt-5 px-6 py-3 text-sm">
            Update fridge stock
          </Link>
        </motion.div>
      )}

      {!busy && (hero || rest.length > 0) && (
        <>
          {hero && (
            <HeroRecipeCard
              recipe={hero}
              saved={saved.has(hero.id)}
              onToggleSave={() => toggle(hero.id)}
              onCook={() => handleCook(hero)}
            />
          )}
          {rest.length > 0 && (
            <motion.div
              className="grid grid-cols-2 gap-3.5"
              variants={staggerGrid}
              initial="hidden"
              animate="show"
            >
              {rest.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  saved={saved.has(recipe.id)}
                  onToggleSave={() => toggle(recipe.id)}
                  onCook={() => handleCook(recipe)}
                  showLock
                />
              ))}
            </motion.div>
          )}
        </>
      )}

      <AnimatePresence>
        {justCooked && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 28, x: '-50%', scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
            exit={{ opacity: 0, y: 12, x: '-50%', scale: 0.95 }}
            transition={springBouncy}
            className="fixed left-1/2 bottom-44 z-40 btn-pill px-5 py-2.5 text-[13px] shadow-lg"
          >
            Logged “{justCooked}”
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
