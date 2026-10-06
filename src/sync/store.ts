import type { KerixDb, Thought } from '../data/db'

const CURSOR_KEY = 'sync.cursor'

/** What the engine needs from the device database. Implemented over Dexie; one instance per device. */
export interface LocalStore {
  outboxIds(): Promise<string[]>
  getThoughts(ids: string[]): Promise<Thought[]>
  /** Removes outbox entries only if the thought was not changed again since it was read for pushing. */
  clearOutbox(pushed: { id: string; updatedAt: string }[]): Promise<void>
  /** Writes remote rows, keeping any local row whose updatedAt is newer. Never touches the outbox. */
  applyRemote(rows: Thought[]): Promise<void>
  getCursor(): Promise<string | null>
  setCursor(cursor: string): Promise<void>
}

export function dexieStore(d: KerixDb): LocalStore {
  return {
    async outboxIds() {
      return (await d.outbox.toArray()).map((e) => e.id)
    },

    async getThoughts(ids) {
      const rows = await d.thoughts.bulkGet(ids)
      return rows.filter((r): r is Thought => r !== undefined)
    },

    async clearOutbox(pushed) {
      await d.transaction('rw', d.thoughts, d.outbox, async () => {
        for (const { id, updatedAt } of pushed) {
          const current = await d.thoughts.get(id)
          if (current && current.updatedAt === updatedAt) await d.outbox.delete(id)
        }
      })
    },

    async applyRemote(rows) {
      await d.transaction('rw', d.thoughts, async () => {
        for (const row of rows) {
          const local = await d.thoughts.get(row.id)
          if (!local || row.updatedAt > local.updatedAt) await d.thoughts.put(row)
        }
      })
    },

    async getCursor() {
      return (await d.meta.get(CURSOR_KEY))?.value ?? null
    },

    async setCursor(cursor) {
      await d.meta.put({ key: CURSOR_KEY, value: cursor })
    },
  }
}
