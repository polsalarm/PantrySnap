import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRecipeViews, useSaved } from '../lib/useRecipeViews';
import { urgentItems } from '../lib/recipeview';
import RecipeCard, { HeroRecipeCard } from '../components/RecipeCard';
import type { RecipeView } from '../lib/recipeview';

export default function FridgeHome() {
  const { items, views, busy, cook } = useRecipeViews(12);
  const { saved, toggle } = useSaved();
  const [justCooked, setJustCooked] = useState<string | null>(null);

  const ready = views.filter((v) => v.ready);
  const hero: RecipeView | undefined = ready[0];
  const rest = ready.slice(1);

  const stockCount = items?.length ?? 0;
  const expiringCount = items ? urgentItems(items).length : 0;

  async function handleCook(recipe: RecipeView) {
    await cook(recipe);
    setJustCooked(recipe.title);
    setTimeout(() => setJustCooked(null), 2400);
  }

  return (
    <main className="max-w-md mx-auto px-5 pt-6 pb-40">
      <div
        className="card-plate card-plate-lg px-[18px] pt-[18px] pb-4 mb-6"
        style={{ background: 'var(--color-tint-cool)' }}
      >
        <div className="text-[11px] font-extrabold text-[#245D89] uppercase tracking-[1px]">
          Tonight
        </div>
        <h2 className="mt-1.5 text-[30px] font-extrabold text-ink tracking-[-0.6px] leading-[1.1]">
          Ready to cook
        </h2>
        <p className="mt-2 text-[13.5px] font-semibold text-ink/70 leading-snug">
          {stockCount === 0
            ? 'Add a few staples and meals will appear here.'
            : `${ready.length} ${ready.length === 1 ? 'meal' : 'meals'} from what's already in storage.` +
              (expiringCount > 0
                ? ` ${expiringCount} ${expiringCount === 1 ? 'ingredient wants' : 'ingredients want'} using up first.`
                : '')}
        </p>
      </div>

      {busy && (
        <div className="grid grid-cols-2 gap-3.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-60" />
          ))}
        </div>
      )}

      {!busy && ready.length === 0 && (
        <div
          className="card-plate card-plate-lg px-5 py-8 flex flex-col items-center text-center"
          style={{ background: '#E4EFF8' }}
        >
          <div className="emoji-well size-[82px] text-[38px]">🧊</div>
          <p className="mt-4 text-lg font-extrabold text-ink">No recipes ready yet</p>
          <p className="mt-2 text-[13.5px] font-semibold text-ink-soft leading-relaxed max-w-[260px]">
            Add a few staples to your fridge and we&rsquo;ll match recipes to what you already have.
          </p>
          <Link to="/items/new" className="btn-pill mt-5 px-6 py-3 text-sm">
            Update fridge stock
          </Link>
        </div>
      )}

      {!busy && hero && (
        <>
          <HeroRecipeCard
            recipe={hero}
            saved={saved.has(hero.id)}
            onToggleSave={() => toggle(hero.id)}
            onCook={() => handleCook(hero)}
          />
          {rest.length > 0 && (
            <div className="grid grid-cols-2 gap-3.5">
              {rest.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  saved={saved.has(recipe.id)}
                  onToggleSave={() => toggle(recipe.id)}
                  onCook={() => handleCook(recipe)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {justCooked && (
        <div
          role="status"
          className="fixed left-1/2 -translate-x-1/2 bottom-44 z-40 btn-pill px-5 py-2.5 text-[13px] animate-in shadow-lg"
        >
          Logged “{justCooked}”
        </div>
      )}

      {!busy && ready.length > 0 && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-[104px] z-30">
          <Link
            to="/items/new"
            className="btn-pill flex items-center gap-2 px-[22px] py-[13px] text-sm whitespace-nowrap shadow-[0_8px_20px_rgba(0,0,0,0.28)]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Update fridge stock
          </Link>
        </div>
      )}
    </main>
  );
}
