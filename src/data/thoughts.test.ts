import { db } from './db'
import { addThought, listOpen } from './thoughts'
import { parseTags } from './tags'

beforeEach(async () => {
  await db.thoughts.clear()
  await db.outbox.clear()
})

describe('parseTags (criterion 7)', () => {
  it('lowercases and deduplicates hashtags in order of first appearance', () => {
    expect(parseTags('Call #money about #Money')).toEqual(['money'])
    expect(parseTags('#writing then #life then #writing')).toEqual(['writing', 'life'])
  })
  it('returns no tags when there are none', () => {
    expect(parseTags('no tags here')).toEqual([])
  })
})

describe('addThought', () => {
  it('trims and stores the text with derived tags', async () => {
    const t = await addThought({ text: '  Call #money about #Money  ' })
    expect(t?.text).toBe('Call #money about #Money')
    expect(t?.tags).toEqual(['money'])
    expect(t?.doneAt).toBeNull()
    expect(t?.deletedAt).toBeNull()
    expect(t?.device).toMatch(/^[0-9a-f]{8}$/)
  })

  it('writes nothing for whitespace (criterion 2)', async () => {
    expect(await addThought({ text: '   ' })).toBeNull()
    expect(await db.thoughts.count()).toBe(0)
  })

  it('never leaves updatedAt before createdAt (invariant)', async () => {
    const t = await addThought({ text: 'x' })
    expect(t && t.updatedAt >= t.createdAt).toBe(true)
  })

  it('queues every new thought in the outbox (spec 002)', async () => {
    const t = await addThought({ text: 'sync me' })
    expect(await db.outbox.get(t!.id)).toEqual({ id: t!.id })
  })

  it('persists in the database (criterion 4)', async () => {
    const t = await addThought({ text: 'Buy olives' })
    expect(await db.thoughts.get(t!.id)).toMatchObject({ text: 'Buy olives' })
  })
})

describe('listOpen', () => {
  it('returns newest first even when captured in the same millisecond (criterion 3)', async () => {
    await addThought({ text: 'A' })
    await addThought({ text: 'B' })
    const texts = (await listOpen()).map((t) => t.text)
    expect(texts).toEqual(['B', 'A'])
  })

  it('excludes done and deleted rows', async () => {
    const open = await addThought({ text: 'open' })
    const done = await addThought({ text: 'done' })
    const gone = await addThought({ text: 'gone' })
    await db.thoughts.update(done!.id, { doneAt: new Date().toISOString() })
    await db.thoughts.update(gone!.id, { deletedAt: new Date().toISOString() })
    expect((await listOpen()).map((t) => t.id)).toEqual([open!.id])
  })
})
