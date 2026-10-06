const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** "just now", "2 min ago", "3 h ago", "yesterday", "4 days ago", then a short date. Computed at render, not live. */
export function formatRelative(iso: string, now: number = Date.now()): string {
  const diff = now - new Date(iso).getTime()
  if (diff < MINUTE) return 'just now'
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} min ago`
  if (diff < DAY) return `${Math.floor(diff / HOUR)} h ago`
  if (diff < 2 * DAY) return 'yesterday'
  if (diff < 30 * DAY) return `${Math.floor(diff / DAY)} days ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
