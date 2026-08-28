import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Clock3, Send, Zap } from 'lucide-react';
import { db, type Item } from '../lib/db';
import { sendChat, aiErrorMessage, type ChatMessage } from '../lib/api';
import { daysUntil } from '../lib/expiry';
import { urgentItems } from '../lib/recipeview';
import FoodReply from '../components/FoodReply';
import Mascot from '../components/Mascot';
import { fadeUp, springBouncy, springSoft, staggerFast } from '../lib/motion';

const SUGGESTIONS = [
  'What can I cook tonight?',
  "What's expiring on my shelves?",
  'Quick breakfast idea',
  'How should I store leftovers?',
];

const EMPTY_ITEMS: Item[] = [];

function WaveBars({ active }: { active?: boolean }) {
  return (
    <span className="flex items-end justify-center gap-[2px] h-3.5" aria-hidden>
      {[0.55, 1, 0.7, 0.9, 0.5].map((h, i) => (
        <motion.span
          key={i}
          className="w-[2.5px] rounded-full bg-white"
          style={{ height: `${h * 100}%` }}
          animate={
            active
              ? { scaleY: [0.55, 1, 0.65, 1, 0.55], opacity: [0.7, 1, 0.8, 1, 0.7] }
              : undefined
          }
          transition={
            active
              ? { duration: 0.9, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' }
              : undefined
          }
        />
      ))}
    </span>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-[#C45C3E]"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function insightLine(expiring: { name: string; days: number }[], stockCount: number): string {
  if (expiring.length > 0) {
    const soonest = [...expiring].sort((a, b) => a.days - b.days)[0];
    return `Cook, your last 7 days had a very committed relationship with ${soonest.name.toLowerCase()}.`;
  }
  if (stockCount > 0) {
    return 'Cook, your last 7 days were quiet — ask Steve what to make with what’s already in.';
  }
  return 'Cook, stock a few staples and Steve will keep watch on your shelves.';
}

export default function Chat() {
  const items = useLiveQuery(() => db.items.toArray(), []) ?? EMPTY_ITEMS;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tipsOpen, setTipsOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const expiring = useMemo(() => urgentItems(items), [items]);
  const expiringCount = expiring.length;
  const empty = messages.length === 0;

  const insight = useMemo(
    () =>
      insightLine(
        expiring.map((i) => ({ name: i.name, days: daysUntil(i.expiryDate) })),
        items.length,
      ),
    [expiring, items.length],
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setError(null);
    const next = [...messages, { role: 'user' as const, text: q }];
    setMessages(next);
    setInput('');
    setBusy(true);
    setTipsOpen(false);
    try {
      const pantry = items.map((i) => ({
        name: i.name,
        expiryDate: i.expiryDate,
        quantityPct: i.quantityPct,
      }));
      const reply = await sendChat(next, pantry);
      setMessages((m) => [...m, { role: 'model', text: reply }]);
    } catch (e) {
      setError(aiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="relative flex flex-col h-full overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 70% 55% at 28% 32%, rgba(255, 186, 148, 0.45) 0%, transparent 62%), #FDFBF7',
      }}
    >
      {/* Top chrome */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-5 pb-2">
        <Link
          to="/profile"
          aria-label="Back to profile"
          className="size-10 grid place-items-center rounded-full text-[#2D2424] hover:bg-black/5 transition-colors"
        >
          <ArrowLeft size={22} strokeWidth={2.25} />
        </Link>

        <Link
          to="/alerts"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#2D2424]/[0.06] px-3.5 py-2 text-[13px] font-semibold text-[#2D2424] no-underline hover:bg-[#2D2424]/[0.1] transition-colors"
        >
          <Clock3 size={14} strokeWidth={2.25} />
          {expiringCount === 0
            ? 'All fresh'
            : `${expiringCount} expiring`}
        </Link>
      </header>

      <main className="relative z-10 flex-1 min-h-0 overflow-y-auto px-6 pb-4">
        {empty ? (
          <motion.div
            className="flex flex-col items-start pt-2 max-w-md mx-auto w-full"
            variants={staggerFast}
            initial="hidden"
            animate="show"
          >
            <motion.h1
              variants={fadeUp}
              className="text-[42px] sm:text-[46px] font-extrabold tracking-[-1.2px] leading-none text-[#2D2424]"
            >
              Hey cook{' '}
              <motion.span
                className="inline-block origin-[70%_70%]"
                animate={{ rotate: [0, 18, -8, 14, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }}
                aria-hidden
              >
                👋
              </motion.span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-4 text-[15px] sm:text-[16px] font-medium leading-snug text-[#2D2424]/85 max-w-[20rem]"
            >
              {insight}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 self-center">
              <Mascot size={88} className="opacity-90 drop-shadow-[0_10px_18px_rgba(45,36,36,0.12)]" />
            </motion.div>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3.5 max-w-md mx-auto w-full pt-2">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={`${i}-${m.role}-${m.text.slice(0, 12)}`}
                  initial={{
                    opacity: 0,
                    x: m.role === 'user' ? 24 : -24,
                    scale: 0.96,
                  }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={springSoft}
                  className={`max-w-[85%] px-4 py-3 text-[13px] sm:text-sm font-semibold leading-relaxed ${
                    m.role === 'user'
                      ? 'self-end rounded-[22px] rounded-br-md bg-[#2D2424] text-white shadow-[0_8px_20px_rgba(45,36,36,0.18)] whitespace-pre-wrap'
                      : 'self-start rounded-[22px] rounded-bl-md bg-white/90 text-[#2D2424] border border-[#2D2424]/8 shadow-[0_6px_16px_rgba(45,36,36,0.06)]'
                  }`}
                >
                  {m.role === 'model' && (
                    <span className="text-[10px] font-extrabold text-[#C45C3E] uppercase tracking-[0.8px] block mb-1">
                      Steve
                    </span>
                  )}
                  {m.role === 'model' ? <FoodReply text={m.text} /> : m.text}
                </motion.div>
              ))}
            </AnimatePresence>
            {busy && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="self-start rounded-[22px] rounded-bl-md bg-white/90 px-4 py-3 text-[13px] font-semibold text-[#2D2424]/80 border border-[#2D2424]/8 flex items-center gap-2"
              >
                <TypingDots />
                <span>Steve is checking the shelves…</span>
              </motion.div>
            )}
            {error && (
              <p className="text-[#B31E1E] text-xs font-bold text-center bg-[#FDECEC] p-2.5 rounded-2xl border border-[#F5C2C2]">
                {error}
              </p>
            )}
            <div ref={endRef} />
          </div>
        )}
      </main>

      {/* Composer — a normal flex child pinned to the bottom of the page's own
          column, not position:fixed. Avoids depending on the phone-frame's
          transform-based containing-block trick, which is fragile across browsers. */}
      <div className="relative z-10 mt-auto shrink-0 px-4 pt-2 pb-8">
        <div className="max-w-md mx-auto">
              <AnimatePresence>
                {tipsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, y: 8 }}
                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: 8 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-2 overflow-x-auto pb-3 px-1">
                      {SUGGESTIONS.map((s) => (
                        <motion.button
                          key={s}
                          type="button"
                          whileTap={{ scale: 0.96 }}
                          onClick={() => send(s)}
                          className="shrink-0 text-[12px] bg-white/90 border border-[#2D2424]/10 text-[#2D2424] font-semibold rounded-full px-3.5 py-1.5 shadow-[0_4px_12px_rgba(45,36,36,0.06)]"
                        >
                          {s}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void send(input);
                }}
                className="flex items-center gap-2.5"
              >
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setTipsOpen((v) => !v);
                    inputRef.current?.focus();
                  }}
                  aria-label={tipsOpen ? 'Hide suggestions' : 'Show suggestions'}
                  aria-pressed={tipsOpen}
                  className={`size-11 shrink-0 grid place-items-center rounded-full transition-colors ${
                    tipsOpen ? 'bg-[#FFE4D1] text-[#C45C3E]' : 'text-[#2D2424]/70 hover:bg-[#2D2424]/5'
                  }`}
                >
                  <Zap size={20} strokeWidth={2.2} fill={tipsOpen ? 'currentColor' : 'none'} />
                </motion.button>

                <div className="flex-1 flex items-center gap-1 rounded-full border border-[#2D2424]/12 bg-white pl-5 pr-1.5 py-1 shadow-[0_10px_28px_rgba(45,36,36,0.1)]">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything"
                    className="flex-1 min-w-0 bg-transparent text-[15px] font-medium text-[#2D2424] placeholder:text-[#2D2424]/35 outline-none py-2.5"
                  />
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.04 }}
                    disabled={busy}
                    aria-label={input.trim() ? 'Send message' : 'Type a message'}
                    transition={springBouncy}
                    className="size-11 shrink-0 rounded-full bg-[#2D2424] text-white grid place-items-center disabled:opacity-100 shadow-[0_6px_14px_rgba(45,36,36,0.28)]"
                  >
                    {input.trim() ? <Send size={15} strokeWidth={2.4} /> : <WaveBars active={busy} />}
                  </motion.button>
                </div>
              </form>
        </div>
      </div>
    </div>
  );
}
