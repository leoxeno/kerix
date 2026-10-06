import type { Thought } from '../data/db'
import type { Relay, RemoteThought } from './relay'

/**
 * In-memory relay for tests. Mirrors the server's rules: last-writer-wins by updatedAt,
 * a monotonic server stamp on every accepted write, paged pulls oldest first.
 */
export class FakeRelay implements Relay {
  readonly rows = new Map<string, RemoteThought>()
  private tick = 0
  /** Set to make the next call(s) fail, to simulate the relay being unreachable. */
  failNext = 0
  pageSize = 100

  private stamp(): string {
    this.tick += 1
    return String(this.tick).padStart(12, '0')
  }

  private maybeFail(): void {
    if (this.failNext > 0) {
      this.failNext -= 1
      throw new Error('relay unreachable')
    }
  }

  async push(rows: Thought[]): Promise<void> {
    this.maybeFail()
    for (const row of rows) {
      const existing = this.rows.get(row.id)
      if (existing && row.updatedAt < existing.updatedAt) continue
      this.rows.set(row.id, { ...row, serverUpdatedAt: this.stamp() })
    }
  }

  async pull(since: string | null): Promise<{ rows: RemoteThought[]; cursor: string | null }> {
    this.maybeFail()
    const rows = [...this.rows.values()]
      .filter((r) => since === null || r.serverUpdatedAt > since)
      .sort((a, b) => (a.serverUpdatedAt < b.serverUpdatedAt ? -1 : 1))
      .slice(0, this.pageSize)
    return { rows, cursor: rows.length ? rows[rows.length - 1].serverUpdatedAt : null }
  }
}
