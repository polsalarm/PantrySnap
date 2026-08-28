/** Keep cooking Markdown; drop code fences and social hashtags like #dinner. */
export function tidyFoodMarkdown(raw: string): string {
  return raw
    .replace(/```(?:\w+)?\n?([\s\S]*?)```/g, '$1')
    .replace(/(^|[^\n#])#([\p{L}\p{N}_]+)/gu, '$1')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
