// DeepSeek client — powers the chat assistant. OpenAI-compatible REST, so it's
// one fetch call; no SDK dependency. Docs: https://api-docs.deepseek.com
//
// Key-gated the same way Gemini is: unset DEEPSEEK_API_KEY and chat falls back
// to Gemini (see sources/ai.ts).
const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
const baseUrl = process.env.DEEPSEEK_BASE_URL?.trim() || 'https://api.deepseek.com';

export const deepseekEnabled = Boolean(apiKey);

export const DEEPSEEK_MODELS = {
  flash: 'deepseek-v4-flash', // chat — cheap/fast
  pro: 'deepseek-v4-pro', // reserved for quality-sensitive generation
} as const;

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /** JSON Output mode. The prompt must also mention "json". */
  json?: boolean;
  timeoutMs?: number;
}

/** POST /chat/completions -> assistant text. Throws on non-2xx. */
export async function deepseekChat(
  messages: DeepSeekMessage[],
  opts: DeepSeekOptions = {},
): Promise<string> {
  if (!apiKey) throw new Error('DeepSeek not configured (set DEEPSEEK_API_KEY)');

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model ?? DEEPSEEK_MODELS.flash,
      messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 1024,
      stream: false,
      ...(opts.json ? { response_format: { type: 'json_object' } } : {}),
    }),
    signal: AbortSignal.timeout(opts.timeoutMs ?? 30_000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`deepseek ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? '';
}
