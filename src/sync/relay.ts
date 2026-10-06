import type { Thought } from '../data/db'

/** A thought as the relay returns it: the row plus the server's own write time, which is the pull cursor. */
export interface RemoteThought extends Thought {
  serverUpdatedAt: string
}

/** Drops the server stamp so a remote row can be stored as a plain Thought. */
export function toThought(r: RemoteThought): Thought {
  return {
    id: r.id,
    text: r.text,
    tags: r.tags,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    doneAt: r.doneAt,
    deletedAt: r.deletedAt,
    device: r.device,
  }
}

/** The sync engine's only view of the outside world. Supabase implements it; tests use an in-memory fake. */
export interface Relay {
  /** Upsert these rows. The relay applies last-writer-wins by updatedAt. Throws on failure; nothing is partially acknowledged. */
  push(rows: Thought[]): Promise<void>
  /** Rows changed on the server after `since` (a cursor from a previous pull), oldest first, one page at a time. */
  pull(since: string | null): Promise<{ rows: RemoteThought[]; cursor: string | null }>
}
