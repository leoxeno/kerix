const HASHTAG = /#([\p{L}\p{N}_-]+)/gu

/**
 * The only writer of Thought.tags. Lowercase, deduplicated, in order of first appearance, without the '#'.
 */
export function parseTags(text: string): string[] {
  const seen = new Set<string>()
  for (const match of text.matchAll(HASHTAG)) {
    seen.add(match[1].toLowerCase())
  }
  return [...seen]
}
