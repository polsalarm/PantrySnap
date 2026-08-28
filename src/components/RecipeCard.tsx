import { useRef } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { type RecipeView, tintFor, rescueLabel } from '../lib/recipeview';
import DishIcon from './DishIcon';
import { fadeUp, springSnappy } from '../lib/motion';

export function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="shrink-0">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function ServesIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="shrink-0">
      <path d="M4 18a8 8 0 0 1 16 0z" />
      <path d="M3 21h18" />
    </svg>
  );
}

export function ListIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="shrink-0">
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h10" />
    </svg>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <motion.svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill={filled ? '#D92626' : 'none'}
      stroke={filled ? '#D92626' : 'rgba(30,41,59,0.35)'}
      strokeWidth="2"
      className="pointer-events-none"
      animate={filled ? { scale: [1, 1.25, 1] } : { scale: 1 }}
      transition={springSnappy}
    >
      <path d="M12 21s-7.5-4.7-10-9.3C0.3 8 1.6 4 5.4 3.2 8 2.6 10.4 4 12 6.3 13.6 4 16 2.6 18.6 3.2 22.4 4 23.7 8 22 11.7 19.5 16.3 12 21 12 21z" />
    </motion.svg>
  );
}

function LockBadge() {
  return (
    <div className="absolute -bottom-1 -right-1 size-[22px] rounded-full bg-ink border-2 border-white grid place-items-center">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
        <rect x="5" y="11" width="14" height="9" rx="1" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
    </div>
  );
}

function MetaRows({ recipe }: { recipe: RecipeView }) {
  return (
    <div className="mt-2 flex flex-col gap-1.5 text-ink-soft">
      {recipe.mins !== undefined && (
        <div className="flex items-center gap-1.5 text-[11.5px] font-bold">
          <ClockIcon />
          {recipe.mins} min
        </div>
      )}
      {recipe.serves !== undefined && (
        <div className="flex items-center gap-1.5 text-[11.5px] font-bold">
          <ServesIcon />
          Serves {recipe.serves}
        </div>
      )}
      <div className="flex items-center gap-1.5 text-[11.5px] font-bold">
        <ListIcon />
        {recipe.ingredientCount} ingredient{recipe.ingredientCount === 1 ? '' : 's'}
      </div>
    </div>
  );
}

function burstHearts(anchor: HTMLElement) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const rect = anchor.getBoundingClientRect();
  for (let i = 0; i < 5; i++) {
    const el = document.createElement('span');
    el.textContent = '♥';
    el.style.cssText = `position:fixed;left:${rect.left + rect.width / 2}px;top:${rect.top}px;color:#D92626;font-size:12px;pointer-events:none;z-index:9999;`;
    document.body.appendChild(el);
    gsap.to(el, {
      x: (Math.random() - 0.5) * 48,
      y: -28 - Math.random() * 24,
      opacity: 0,
      scale: 0.4,
      duration: 0.55,
      ease: 'power2.out',
      onComplete: () => el.remove(),
    });
  }
}

export function HeroRecipeCard({
  recipe,
  saved,
  onToggleSave,
  onCook,
}: {
  recipe: RecipeView;
  saved: boolean;
  onToggleSave: () => void;
  onCook: () => void;
}) {
  const heartRef = useRef<HTMLButtonElement>(null);
  return (
    <motion.article
      variants={fadeUp}
      initial="hidden"
      animate="show"
      whileHover={{ y: -4, scale: 1.01 }}
      transition={springSnappy}
      className="card-plate card-plate-lg p-4 flex gap-3.5 items-start mb-4 group"
      style={{ background: tintFor(recipe.category) }}
    >
      <motion.div
        className="emoji-well size-[82px] overflow-hidden text-ink"
        whileHover={{ scale: 1.06, rotate: -2 }}
        transition={springSnappy}
      >
        {recipe.image ? (
          <img src={recipe.image} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <DishIcon iconKey={recipe.iconKey} size={34} strokeWidth={1.75} />
        )}
      </motion.div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-extrabold text-ink-soft uppercase tracking-[1px]">
          Cook this first
        </div>
        <h3 className="mt-1 text-[19px] font-extrabold text-ink leading-tight tracking-[-0.3px]">
          {recipe.title}
        </h3>
        <div className="mt-1.5 text-xs font-semibold text-ink-soft">
          {[
            recipe.mins !== undefined ? `${recipe.mins} min` : null,
            recipe.serves !== undefined ? `Serves ${recipe.serves}` : null,
            `${recipe.ingredientCount} ingredients`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-2.5">
          <span
            className={`text-[12.5px] font-extrabold truncate ${
              recipe.rescues ? 'text-[#B31E1E]' : 'text-ink-soft'
            }`}
          >
            {recipe.rescues ? rescueLabel(recipe.rescues) : 'Ready'}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={onCook}
              className="btn-pill px-3.5 py-2 text-[11px]"
              aria-label={`Mark ${recipe.title} as cooked`}
            >
              Cooked it
            </motion.button>
            <motion.button
              ref={heartRef}
              whileTap={{ scale: 0.85 }}
              onClick={() => {
                if (!saved && heartRef.current) burstHearts(heartRef.current);
                onToggleSave();
              }}
              aria-label={saved ? 'Remove from saved' : 'Save recipe'}
              aria-pressed={saved}
              className="size-[34px] rounded-full border-2 border-ink bg-white grid place-items-center cursor-pointer p-0 shrink-0"
            >
              <Heart filled={saved} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function RecipeCard({
  recipe,
  saved,
  onToggleSave,
  onCook,
  showLock = false,
}: {
  recipe: RecipeView;
  saved?: boolean;
  onToggleSave?: () => void;
  onCook?: () => void;
  showLock?: boolean;
}) {
  const heartRef = useRef<HTMLButtonElement>(null);
  const locked = showLock && !recipe.ready;
  return (
    <motion.article
      variants={fadeUp}
      layout
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={springSnappy}
      className="card-plate p-4 px-3.5 flex flex-col"
      style={{ background: tintFor(recipe.category) }}
    >
      <motion.div
        className="emoji-well size-16 self-center relative overflow-visible text-ink"
        whileHover={{ scale: 1.08, rotate: 3 }}
        transition={springSnappy}
      >
        {recipe.image ? (
          <img src={recipe.image} alt="" loading="lazy" className="size-full object-cover rounded-full" />
        ) : (
          <DishIcon iconKey={recipe.iconKey} size={26} strokeWidth={1.75} />
        )}
        {locked && <LockBadge />}
      </motion.div>

      <h3 className="mt-3 text-[15px] font-bold text-ink leading-snug">{recipe.title}</h3>
      <div className="mt-1.5 text-[10.5px] font-extrabold text-ink-soft uppercase tracking-[0.6px]">
        {recipe.category}
        {recipe.level ? ` · ${recipe.level}` : ''}
      </div>

      <MetaRows recipe={recipe} />

      <div className="border-t-2 border-ink/15 my-3" />

      <div className="flex items-center justify-between gap-1.5">
        {locked ? (
          <span className="text-xs font-extrabold text-ink-soft">
            {recipe.haveCount} of {recipe.ingredientCount} ingredients
          </span>
        ) : (
          <span
            className={`text-xs font-extrabold truncate ${
              recipe.rescues ? 'text-[#B31E1E]' : 'text-ink-soft'
            }`}
          >
            {recipe.rescues ? rescueLabel(recipe.rescues) : 'Ready'}
          </span>
        )}

        <div className="flex items-center gap-1.5 shrink-0">
          {onCook && !locked && (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={onCook}
              aria-label={`Mark ${recipe.title} as cooked`}
              className="size-8 rounded-full border-2 border-ink bg-white grid place-items-center cursor-pointer p-0"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round">
                <path d="M4 12l6 6L20 6" />
              </svg>
            </motion.button>
          )}
          {onToggleSave && (
            <motion.button
              ref={heartRef}
              whileTap={{ scale: 0.85 }}
              onClick={() => {
                if (!saved && heartRef.current) burstHearts(heartRef.current);
                onToggleSave();
              }}
              aria-label={saved ? 'Remove from saved' : 'Save recipe'}
              aria-pressed={saved}
              className="size-8 rounded-full border-2 border-ink bg-white grid place-items-center cursor-pointer p-0"
            >
              <Heart filled={Boolean(saved)} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
