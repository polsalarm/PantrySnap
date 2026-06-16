import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { RECIPE_SEED } from '../lib/recipes';
import { matchRecipes } from '../lib/match';
import TopBar from '../components/TopBar';

export default function Recipes() {
  const items = useLiveQuery(() => db.items.toArray(), []) ?? [];
  const matches = matchRecipes(items, RECIPE_SEED);

  return (
    <div>
      <TopBar title="Recipes" />
      <main className="max-w-2xl mx-auto px-5 pt-2 pb-28">
        <p className="text-text-muted mb-4">Cook with what you have.</p>

        {items.length === 0 ? (
          <p className="text-text-muted text-center mt-8">Add some items to see recipe matches.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {matches.map(({ recipe, matched, missing, matchPct }) => (
              <div key={recipe.id} className="bg-surface rounded-2xl p-4 card-shadow flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{recipe.emoji}</span>
                    <h3 className="text-lg font-semibold text-text">{recipe.name}</h3>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      matchPct >= 75
                        ? 'bg-primary-soft text-primary-dark'
                        : matchPct >= 40
                          ? 'bg-warn-soft text-accent-dark'
                          : 'bg-border-soft text-text-muted'
                    }`}
                  >
                    {matchPct}% match
                  </span>
                </div>
                <p className="text-sm text-text-muted">
                  {matched.length}/{recipe.ingredients.length} ingredients on hand
                </p>
                {missing.length > 0 && (
                  <p className="text-xs text-text-muted">
                    Missing: {missing.join(', ')}
                  </p>
                )}
                <details className="text-sm mt-1">
                  <summary className="cursor-pointer text-primary font-medium">View steps</summary>
                  <ol className="list-decimal pl-5 mt-2 space-y-1 text-text">
                    {recipe.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </details>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
