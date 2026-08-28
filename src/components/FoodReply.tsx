import { tidyFoodMarkdown } from '../lib/plainChat';

type Block =
  | { type: 'h'; level: 1 | 2 | 3; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] };

function parseBlocks(raw: string): Block[] {
  const lines = tidyFoodMarkdown(raw).split('\n');
  const blocks: Block[] = [];

  const flushPara = (buf: string[]) => {
    const text = buf.join(' ').trim();
    if (text) blocks.push({ type: 'p', text });
    buf.length = 0;
  };

  const para: string[] = [];
  for (const line of lines) {
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    const labeled = /^(?:\*\*)?(ingredients|steps|method|directions|tip|notes|you.?ll need|serves|time)(?:\*\*)?:?\s*$/i.exec(
      line.replace(/\*+/g, ''),
    );
    const bullet = /^[-*•]\s+(.+)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.+)$/.exec(line);

    if (!line.trim()) {
      flushPara(para);
      continue;
    }
    if (heading) {
      flushPara(para);
      const level = Math.min(heading[1].length, 3) as 1 | 2 | 3;
      blocks.push({ type: 'h', level, text: heading[2].trim() });
      continue;
    }
    if (labeled) {
      flushPara(para);
      blocks.push({ type: 'h', level: 2, text: labeled[1] });
      continue;
    }
    if (bullet) {
      flushPara(para);
      const last = blocks[blocks.length - 1];
      if (last?.type === 'ul') last.items.push(bullet[1]);
      else blocks.push({ type: 'ul', items: [bullet[1]] });
      continue;
    }
    if (numbered) {
      flushPara(para);
      const last = blocks[blocks.length - 1];
      if (last?.type === 'ol') last.items.push(numbered[1]);
      else blocks.push({ type: 'ol', items: [numbered[1]] });
      continue;
    }
    para.push(line.trim());
  }
  flushPara(para);
  return blocks;
}

function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="font-extrabold text-ink">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/** Cooking-assistant layout: dish title, section labels, ingredient bullets, numbered steps. */
export default function FoodReply({ text }: { text: string }) {
  const blocks = parseBlocks(text);
  const skip = new Set<number>();
  return (
    <div className="flex flex-col gap-2.5 text-[13px] sm:text-sm font-semibold leading-relaxed text-[#2D2424]">
      {blocks.map((block, i) => {
        if (skip.has(i)) return null;
        if (block.type === 'h' && block.level !== 1 && /^tips?$/i.test(block.text)) {
          const next = blocks[i + 1];
          const tipBody = next?.type === 'p' ? next.text : '';
          if (next?.type === 'p') skip.add(i + 1);
          return (
            <div
              key={i}
              className="rounded-2xl bg-[#C45C3E]/[0.08] px-3 py-2.5 border border-[#C45C3E]/15"
            >
              <p className="text-[11px] font-extrabold uppercase tracking-[0.9px] text-[#C45C3E]">
                Tip
              </p>
              {tipBody ? (
                <p className="mt-1 leading-relaxed text-[#2D2424]/90">
                  <Rich text={tipBody} />
                </p>
              ) : null}
            </div>
          );
        }
        if (block.type === 'h') {
          if (block.level === 1) {
            return (
              <p key={i} className="text-[16px] sm:text-[17px] font-extrabold tracking-[-0.3px] leading-snug">
                <Rich text={block.text} />
              </p>
            );
          }
          return (
            <p
              key={i}
              className="text-[11px] font-extrabold uppercase tracking-[0.9px] text-[#C45C3E] pt-1"
            >
              <Rich text={block.text} />
            </p>
          );
        }
        if (block.type === 'ul') {
          return (
            <ul key={i} className="flex flex-col gap-1.5 pl-0 list-none">
              {block.items.map((item, j) => (
                <li key={j} className="flex gap-2 leading-snug">
                  <span className="text-[#C45C3E] shrink-0" aria-hidden>
                    •
                  </span>
                  <span>
                    <Rich text={item} />
                  </span>
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === 'ol') {
          return (
            <ol key={i} className="flex flex-col gap-2 pl-0 list-none">
              {block.items.map((item, j) => (
                <li key={j} className="flex gap-2.5 leading-snug">
                  <span className="size-5 shrink-0 rounded-full bg-[#2D2424] text-white text-[10px] font-extrabold grid place-items-center mt-0.5">
                    {j + 1}
                  </span>
                  <span>
                    <Rich text={item} />
                  </span>
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i} className="leading-relaxed text-[#2D2424]/90">
            <Rich text={block.text} />
          </p>
        );
      })}
    </div>
  );
}
