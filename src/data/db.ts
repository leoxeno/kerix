import Dexie, { type EntityTable } from 'dexie'

/** The Thought entity. See docs/architecture/DATA-MODEL.md. */
export interface Thought {
  id: string
  text: string
  tags: string[]
  createdAt: string
  updatedAt: string
  doneAt: string | null
  deletedAt: string | null
  device: string
}

/** A thought with unpushed local changes. */
export interface OutboxEntry {
  id: string
}

/** Small key/value store for sync state, e.g. the pull cursor. */
export interface MetaEntry {
  key: string
  value: string
}

export type KerixDb = Dexie & {
  thoughts: EntityTable<Thought, 'id'>
  outbox: EntityTable<OutboxEntry, 'id'>
  meta: EntityTable<MetaEntry, 'key'>
}

/** Creates a database with the Kerix schema. Tests create several to stand in for several devices. */
export function createKerixDb(name = 'kerix'): KerixDb {
  const d = new Dexie(name) as KerixDb
  d.version(1).stores({
    thoughts: 'id, createdAt, updatedAt, doneAt, deletedAt, *tags',
  })
  d.version(2).stores({
    thoughts: 'id, createdAt, updatedAt, doneAt, deletedAt, *tags',
    outbox: 'id',
    meta: 'key',
  })
  return d
}

export const db = createKerixDb()
