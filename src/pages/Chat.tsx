import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { sendChat, aiErrorMessage, type ChatMessage } from '../lib/api';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';
import AiLock from '../components/AiLock';
import { useAuth } from '../lib/useAuth';

const SUGGESTIONS = [
  'What can I cook tonight?',
  "What's expiring this week?",
  'Give me a quick breakfast idea',
];

export default function Chat() {
  const items = useLiveQuery(() => db.items.toArray(), []) ?? [];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const auth = useAuth();
  const aiLocked = auth.aiRequiresSignIn && !auth.signedIn;

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
    <div className="flex flex-col h-screen">
      <TopBar title="Kitchen Assistant" />
      <main className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full px-5 pb-40 pt-2">
        {messages.length === 0 ? (
          <div className="text-center text-text-muted mt-10">
            <Icon name="forum" className="text-4xl text-primary-soft" />
            <p className="mt-2">Ask me about your pantry.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-primary text-white self-end rounded-br-md'
                    : 'bg-surface text-text self-start rounded-bl-md card-shadow'
                }`}
              >
                {m.text}
              </div>
            ))}
            {busy && (
              <div className="bg-surface text-text-muted self-start rounded-2xl rounded-bl-md px-4 py-2.5 text-sm card-shadow">
                Thinking…
              </div>
            )}
            {error && <p className="text-danger text-sm text-center">{error}</p>}
            <div ref={endRef} />
          </div>
        )}
      </main>

      <div className="fixed bottom-16 left-0 w-full bg-bg/95 backdrop-blur max-w-2xl mx-auto right-0 px-5 py-3 border-t border-border">
        {aiLocked ? (
          <AiLock label="Sign in to chat with the assistant" />
        ) : (
        <>
        {messages.length === 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="shrink-0 text-xs bg-surface border border-border rounded-full px-3 py-1.5 text-text-muted"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything…"
            className="flex-1 bg-surface border border-border rounded-full px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send message"
            className="bg-primary text-white rounded-full w-11 h-11 flex items-center justify-center disabled:opacity-50 shrink-0"
          >
            <Icon name="send" />
          </button>
        </form>
        </>
        )}
      </div>
    </div>
  );
}
