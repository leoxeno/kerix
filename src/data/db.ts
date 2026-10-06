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

export const db = new Dexie('kerix') as Dexie & {
  thoughts: EntityTable<Thought, 'id'>
}

db.version(1).stores({
  thoughts: 'id, createdAt, updatedAt, doneAt, deletedAt, *tags',
})
