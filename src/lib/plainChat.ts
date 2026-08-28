/** Strip Markdown/hashtags so Steve’s replies read as chat, not a document. */
export function plainChatText(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```(?:\w+)?\n?/g, '').replace(/```/g, ''))
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/(^|[^\w])\*(.+?)\*/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^>\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .replace(/(^|\s)#[\p{L}\p{N}_]+/gu, '$1')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
