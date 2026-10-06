import { formatRelative } from './relativeTime'

const now = Date.UTC(2026, 9, 6, 12, 0, 0)
const ago = (ms: number) => new Date(now - ms).toISOString()

describe('formatRelative', () => {
  it('buckets by minute, hour, day', () => {
    expect(formatRelative(ago(30_000), now)).toBe('just now')
    expect(formatRelative(ago(2 * 60_000), now)).toBe('2 min ago')
    expect(formatRelative(ago(3 * 3_600_000), now)).toBe('3 h ago')
    expect(formatRelative(ago(26 * 3_600_000), now)).toBe('yesterday')
    expect(formatRelative(ago(4 * 86_400_000), now)).toBe('4 days ago')
  })
  it('falls back to a short date after a month', () => {
    expect(formatRelative(ago(40 * 86_400_000), now)).toBe('27 Aug')
  })
})
