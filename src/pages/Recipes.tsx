import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Item } from '../lib/db';
import { RECIPE_SEED } from '../lib/recipes';
import { matchRecipes } from '../lib/match';
import { fetchRecipes, generateRecipe, aiErrorMessage, type GeneratedRecipe } from '../lib/api';
import { expiryStatus } from '../lib/expiry';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';
import AiLock from '../components/AiLock';
import { useAuth } from '../lib/useAuth';

// Unified view model so backend (TheMealDB) and local-seed recipes render the same.
interface RecipeCard {
  id: string;
  title: string;
  image?: string;
  emoji?: string;
  matchCount: number;
  totalCount: number;
  usesExpiring: string[];
  missing: string[];
  steps: string[];
}

function normalized(value: string): string {
  return value.toLowerCase().trim();
}

function missingIngredients(ingredients: string[], have: string[]): string[] {
  const onHand = have.map(normalized).filter(Boolean);
  return ingredients.filter((ingredient) => {
    const needle = normalized(ingredient);
    return !onHand.some((item) => needle.includes(item) || item.includes(needle));
  });
}

function expiringNames(items: Item[]): string[] {
  return items.filter((i) => expiryStatus(i.expiryDate) !== 'fresh').map((i) => i.name);
}

export default function Recipes() {
  const items = useLiveQuery(() => db.items.toArray(), []) ?? [];
  const [cards, setCards] = useState<RecipeCard[]>([]);
  const [online, setOnline] = useState(true);
  const [recipesBusy, setRecipesBusy] = useState(false);
  const [gen, setGen] = useState<GeneratedRecipe | null>(null);
  const [genBusy, setGenBusy] = useState(false);
  const [genErr, setGenErr] = useState<string | null>(null);
  const auth = useAuth();
  const aiLocked = auth.aiRequiresSignIn && !auth.signedIn;

  async function handleGenerate() {
    setGenBusy(true);
    setGenErr(null);
    try {
      const have = items.map((i) => i.name);
      const expiring = expiringNames(items);
      setGen(await generateRecipe(have, expiring));
    } catch (e) {
      setGenErr(aiErrorMessage(e));
    } finally {
      setGenBusy(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (items.length === 0) {
        setCards([]);
        setRecipesBusy(false);
        return;
      }
      setRecipesBusy(true);
      const have = items.map((i) => i.name);
      const expiring = expiringNames(items);

      try {
        // Try the Phase 5 data layer first (real recipes, expiry-weighted).
        const api = await fetchRecipes(have, expiring, 12);
        if (cancelled) return;

        if (api) {
          setOnline(true);
          setCards(
            api.map((r) => {
              const missing = missingIngredients(r.ingredients, have);
              const totalCount = r.ingredients.length || r.totalCount;
              return {
                id: r.id,
                title: r.title,
                image: r.image,
                matchCount: Math.max(0, totalCount - missing.length),
                totalCount,
                usesExpiring: r.usesExpiring,
                missing,
                steps: r.steps,
              };
            }),
          );
        } else {
          // Offline / backend down — fall back to the local seed matcher.
          setOnline(false);
          const expSet = new Set(expiring.map((e) => e.toLowerCase()));
          setCards(
            matchRecipes(items, RECIPE_SEED).map((m) => ({
              id: m.recipe.id,
              title: m.recipe.name,
              emoji: m.recipe.emoji,
              matchCount: m.matched.length,
              totalCount: m.recipe.ingredients.length,
              usesExpiring: m.matched.filter((ing) =>
                [...expSet].some((e) => ing.includes(e) || e.includes(ing)),
              ),
              missing: m.missing,
              steps: m.recipe.steps,
            })),
          );
        }
      } finally {
        if (!cancelled) setRecipesBusy(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [items]);

  const hero = cards.find((c) => c.usesExpiring.length > 0);

  return (
    <div>
      <TopBar title="Recipes" />
      <main className="max-w-2xl mx-auto px-5 pt-2 pb-28">
        <p className="text-text-muted mb-4">
          Cook with what you have.{!online && ' (offline — showing saved recipes)'}
        </p>

        {items.length === 0 ? (
          <p className="text-text-muted text-center mt-8">Add some items to see recipe matches.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {aiLocked ? (
              <AiLock label="Sign in to generate AI recipes" />
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={genBusy}
                  className={`relative overflow-hidden flex items-center justify-center gap-2 bg-accent text-white font-semibold rounded-xl py-3 disabled:opacity-80 ${
                    auth.signedIn ? 'animate-shimmer' : ''
                  }`}
                >
                  <Icon name="auto_awesome" className={genBusy ? 'animate-orbit-spark' : ''} filled />
                  {genBusy ? 'AI is building your recipe…' : 'Generate AI recipe from my items'}
                </button>
                {auth.signedIn && !genBusy && (
                  <p className="text-xs text-accent-dark text-center font-medium">
                    AI recipe mode is ready — it prioritizes food expiring soon.
                  </p>
                )}
              </div>
            )}
            {genErr && <p className="text-danger text-sm text-center">{genErr}</p>}
            {genBusy && <AiRecipeLoading />}
            {gen && (
              <div className="bg-surface rounded-2xl p-4 card-shadow flex flex-col gap-2 border border-accent/30">
                <div className="flex items-center gap-2">
                  <Icon name="auto_awesome" className="text-accent" />
                  <h3 className="text-lg font-bold text-text">{gen.title}</h3>
                </div>
                {gen.usesExpiring.length > 0 && (
                  <p className="text-xs text-accent-dark font-medium">
                    Uses expiring: {gen.usesExpiring.join(', ')}
                  </p>
                )}
                <p className="text-sm text-text-muted">Ingredients: {gen.ingredients.join(', ')}</p>
                <ol className="list-decimal pl-5 mt-1 space-y-1 text-sm text-text">
                  {gen.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
                {gen.basedOn && gen.basedOn.length > 0 && (
                  <p className="text-xs text-text-muted mt-1">Inspired by: {gen.basedOn.join(', ')}</p>
                )}
              </div>
            )}
            {hero && (
              <div className="bg-primary text-white rounded-2xl p-4 card-shadow">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-soft">
                  ⏳ Cook to beat expiry
                </p>
                <h3 className="text-lg font-bold mt-1">{hero.title}</h3>
                <p className="text-sm text-primary-soft mt-1">
                  Uses {hero.usesExpiring.length} item{hero.usesExpiring.length > 1 ? 's' : ''} expiring
                  soon: {hero.usesExpiring.join(', ')}
                </p>
              </div>
            )}

            {recipesBusy && <RecipeLoadingCard online={online} />}
            {cards.map((c) => (
              <RecipeRow key={`${c.id}-${c.title}`} card={c} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function AiRecipeLoading() {
  return (
    <div className="animate-in bg-accent/10 border border-accent/25 rounded-2xl p-4 flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-white">
        <Icon name="auto_awesome" className="animate-orbit-spark" filled />
      </span>
      <div>
        <p className="font-semibold text-text">Analyzing your pantry mix</p>
        <p className="text-sm text-text-muted mt-1">
          Matching what you have, rescuing expiring items, then writing practical steps.
        </p>
      </div>
    </div>
  );
}

function RecipeLoadingCard({ online }: { online: boolean }) {
  return (
    <div className="animate-in bg-surface rounded-2xl p-4 card-shadow border border-border flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
        <Icon name={online ? 'restaurant' : 'offline_bolt'} className="animate-orbit-spark" filled />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-text">
          {online ? 'Finding recipe matches…' : 'Building local recipe matches…'}
        </p>
        <div className="skeleton h-2 w-full mt-2" />
      </div>
    </div>
  );
}

function RecipeRow({ card }: { card: RecipeCard }) {
  const matchPct = card.totalCount > 0 ? Math.round((card.matchCount / card.totalCount) * 100) : 0;
  return (
    <div className="animate-in bg-surface rounded-2xl p-4 card-shadow flex flex-col gap-2">
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {card.image ? (
            <img src={card.image} alt={card.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
          ) : (
            <span className="text-2xl">{card.emoji ?? '🍽️'}</span>
          )}
          <h3 className="text-lg font-semibold text-text truncate">{card.title}</h3>
        </div>
        <span
          className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${
            matchPct >= 75
              ? 'bg-primary-soft text-primary-dark'
              : matchPct >= 40
                ? 'bg-warn-soft text-accent-dark'
                : 'bg-border-soft text-text-muted'
          }`}
        >
          {card.matchCount}/{card.totalCount}
        </span>
      </div>
      {card.usesExpiring.length > 0 && (
        <p className="text-xs text-accent-dark font-medium">
          Rescues: {card.usesExpiring.join(', ')}
        </p>
      )}
      {card.missing.length > 0 && (
        <p className="text-xs text-text-muted">Missing: {card.missing.slice(0, 6).join(', ')}</p>
      )}
      <details className="text-sm mt-1">
        <summary className="cursor-pointer text-primary font-medium">View steps</summary>
        <ol className="list-decimal pl-5 mt-2 space-y-1 text-text">
          {card.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </details>
    </div>
  );
}
