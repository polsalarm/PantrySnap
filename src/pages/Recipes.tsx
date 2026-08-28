import { useState } from 'react';
import { generateRecipe, aiErrorMessage, type GeneratedRecipe } from '../lib/api';
import { useRecipeViews, useSaved } from '../lib/useRecipeViews';
import { urgentItems } from '../lib/recipeview';
import RecipeCard from '../components/RecipeCard';
import AiLock from '../components/AiLock';
import { useAuth } from '../lib/useAuth';

export default function Recipes() {
  const { items, views, busy, online, cook } = useRecipeViews(24);
  const { saved, toggle } = useSaved();
  const auth = useAuth();
  const aiLocked = auth.aiRequiresSignIn && !auth.signedIn;

  const [gen, setGen] = useState<GeneratedRecipe | null>(null);
  const [genBusy, setGenBusy] = useState(false);
  const [genErr, setGenErr] = useState<string | null>(null);

  const readyCount = views.filter((v) => v.ready).length;

  // Ready meals first, then the closest near-misses.
  const ordered = [...views].sort(
    (a, b) =>
      Number(b.ready) - Number(a.ready) ||
      b.haveCount / b.ingredientCount - a.haveCount / a.ingredientCount,
  );

  async function handleGenerate() {
    if (!items) return;
    setGenBusy(true);
    setGenErr(null);
    try {
      const expiring = urgentItems(items).map((i) => i.name);
      setGen(await generateRecipe(items.map((i) => i.name), expiring));
    } catch (e) {
      setGenErr(aiErrorMessage(e));
    } finally {
      setGenBusy(false);
    }
  }

  return (
    <main className="max-w-md mx-auto px-5 pt-6 pb-40">
      <div className="mb-5">
        <h2 className="text-[29px] font-extrabold text-ink tracking-[-0.5px]">All recipes</h2>
        <p className="text-sm font-medium text-ink/60 mt-1.5 leading-snug">
          {busy
            ? 'Matching against your storage…'
            : `${readyCount} of ${views.length} ready with what you have`}
          {!busy && !online && ' · offline'}
        </p>
      </div>

      {items && items.length > 0 && (
        <div className="mb-5">
          {aiLocked ? (
            <AiLock label="Sign in to generate AI recipes" />
          ) : (
            <button
              onClick={handleGenerate}
              disabled={genBusy}
              className="card-plate w-full py-3.5 px-4 flex items-center justify-center gap-2 text-sm font-bold text-ink disabled:opacity-70"
              style={{ background: 'var(--color-tint-breakfast)' }}
            >
              <span>✨</span>
              {genBusy ? 'Generating a recipe from your items…' : 'Generate a recipe from my items'}
            </button>
          )}
        </div>
      )}

      {genErr && (
        <p className="card-plate px-3.5 py-2.5 mb-5 text-xs font-bold text-[#B31E1E] bg-primary-soft">
          {genErr}
        </p>
      )}

      {gen && (
        <article className="card-plate card-plate-lg p-4 mb-5 animate-in" style={{ background: '#FFFFFF' }}>
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h3 className="text-lg font-extrabold text-ink">{gen.title}</h3>
          </div>
          {gen.usesExpiring.length > 0 && (
            <p className="mt-2 text-xs font-extrabold text-[#B31E1E]">
              Rescues: {gen.usesExpiring.join(', ')}
            </p>
          )}
          <p className="mt-2 text-xs font-semibold text-ink-soft">
            <span className="font-extrabold text-ink">Ingredients:</span>{' '}
            {gen.ingredients.join(', ')}
          </p>
          <ol className="list-decimal pl-5 mt-3 space-y-1.5 text-xs font-semibold text-ink-soft">
            {gen.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </article>
      )}

      {busy && (
        <div className="grid grid-cols-2 gap-3.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-60" />
          ))}
        </div>
      )}

      {!busy && views.length === 0 && (
        <div
          className="card-plate card-plate-lg px-5 py-8 flex flex-col items-center text-center"
          style={{ background: '#E4EFF8' }}
        >
          <div className="emoji-well size-[82px] text-[38px]">📖</div>
          <p className="mt-4 text-lg font-extrabold text-ink">No recipes to match yet</p>
          <p className="mt-2 text-[13.5px] font-semibold text-ink-soft leading-relaxed max-w-[260px]">
            Add ingredients to your fridge and we&rsquo;ll show what you can make.
          </p>
        </div>
      )}

      {!busy && ordered.length > 0 && (
        <div className="grid grid-cols-2 gap-3.5">
          {ordered.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              saved={saved.has(recipe.id)}
              onToggleSave={() => toggle(recipe.id)}
              onCook={() => cook(recipe)}
              showLock
            />
          ))}
        </div>
      )}
    </main>
  );
}
