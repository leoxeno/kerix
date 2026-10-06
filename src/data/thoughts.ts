import { db, type Thought } from './db'
import { getDeviceId } from './device'
import { parseTags } from './tags'

/** The only module that touches Dexie. Features call these functions. */

let lastStamp = 0

/** ISO timestamp, strictly increasing on this device so ordering by createdAt is never ambiguous. */
function nextTimestamp(): string {
  const now = Math.max(Date.now(), lastStamp + 1)
  lastStamp = now
  return new Date(now).toISOString()
}

/** Adds a thought. Returns null, and writes nothing, when the text is blank. */
export async function addThought(input: { text: string }): Promise<Thought | null> {
  const text = input.text.trim()
  if (!text) return null
  const stamp = nextTimestamp()
  const thought: Thought = {
    id: crypto.randomUUID(),
    text,
    tags: parseTags(text),
    createdAt: stamp,
    updatedAt: stamp,
    doneAt: null,
    deletedAt: null,
    device: getDeviceId(),
  }
  await db.thoughts.add(thought)
  return thought
}

/** Open thoughts, newest first. Excludes done and soft-deleted rows. */
export function listOpen(): Promise<Thought[]> {
  return db.thoughts
    .orderBy('createdAt')
    .reverse()
    .filter((t) => t.doneAt === null && t.deletedAt === null)
    .toArray()
}
