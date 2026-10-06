import { createKerixDb, type KerixDb, type Thought } from '../data/db'
import { SyncEngine, type SyncStatus } from './engine'
import { FakeRelay } from './fakeRelay'
import { toThought } from './relay'
import { dexieStore } from './store'

/** A device: its own database, store and engine. Writes go through the same path the repository uses. */
function device(name: string, relay: FakeRelay, online: { value: boolean } = { value: true }) {
  const d: KerixDb = createKerixDb(name)
  const engine = new SyncEngine(dexieStore(d), () => online.value)
  const statuses: SyncStatus[] = []
  engine.subscribe((s) => statuses.push(s))
  engine.setRelay(relay)
  async function capture(text: string, at: string, id = crypto.randomUUID()): Promise<Thought> {
    const t: Thought = { id, text, tags: [], createdAt: at, updatedAt: at, doneAt: null, deletedAt: null, device: name }
    await d.transaction('rw', d.thoughts, d.outbox, async () => {
      await d.thoughts.put(t)
      await d.outbox.put({ id })
    })
    return t
  }
  const texts = async () =>
    (await d.thoughts.orderBy('createdAt').reverse().toArray()).map((t) => t.text)
  return { d, engine, statuses, capture, texts, online }
}

let n = 0
const fresh = () => `test-${Date.now()}-${n++}`

describe('SyncEngine (spec 002)', () => {
  it('a thought captured on A appears on B after a cycle each (criterion 1)', async () => {
    const relay = new FakeRelay()
    const a = device(fresh(), relay)
    const b = device(fresh(), relay)
    await a.capture('Buy olives', '2026-10-06T10:00:00.000Z')
    await a.engine.schedule()
    await b.engine.schedule()
    expect(await b.texts()).toEqual(['Buy olives'])
    expect(a.engine.getStatus()).toBe('synced')
    expect(await a.d.outbox.count()).toBe(0)
  })

  it('offline captures queue and drain in order when back online (criteria 2, 5)', async () => {
    const relay = new FakeRelay()
    const online = { value: false }
    const a = device(fresh(), relay, online)
    const b = device(fresh(), relay)
    await a.capture('first', '2026-10-06T10:00:00.000Z')
    await a.capture('second', '2026-10-06T10:00:01.000Z')
    await a.engine.schedule()
    expect(a.engine.getStatus()).toBe('offline')
    expect(await a.d.outbox.count()).toBe(2)
    expect(await a.texts()).toEqual(['second', 'first'])
    online.value = true
    await a.engine.schedule()
    await b.engine.schedule()
    expect(await b.texts()).toEqual(['second', 'first'])
    expect(a.engine.getStatus()).toBe('synced')
  })

  it('a relay failure leaves the outbox intact and reports offline (criterion 5)', async () => {
    const relay = new FakeRelay()
    const a = device(fresh(), relay)
    await a.capture('keep me', '2026-10-06T10:00:00.000Z')
    relay.failNext = 1
    await a.engine.schedule()
    expect(a.engine.getStatus()).toBe('offline')
    expect(await a.d.outbox.count()).toBe(1)
    expect(await a.texts()).toEqual(['keep me'])
    await a.engine.schedule()
    expect(a.engine.getStatus()).toBe('synced')
  })

  it('the later updatedAt wins on both devices and the server (criterion 3)', async () => {
    const relay = new FakeRelay()
    const a = device(fresh(), relay)
    const b = device(fresh(), relay)
    const id = crypto.randomUUID()
    await a.capture('older', '2026-10-06T10:00:00.000Z', id)
    await b.capture('newer', '2026-10-06T10:00:05.000Z', id)
    await b.engine.schedule()
    await a.engine.schedule()
    await b.engine.schedule()
    expect(relay.rows.get(id)?.text).toBe('newer')
    expect(await a.texts()).toEqual(['newer'])
    expect(await b.texts()).toEqual(['newer'])
  })

  it('a pull that fails midway skips no rows (criterion 7)', async () => {
    const relay = new FakeRelay()
    relay.pageSize = 2
    const a = device(fresh(), relay)
    const b = device(fresh(), relay)
    await a.capture('one', '2026-10-06T10:00:00.000Z')
    await a.capture('two', '2026-10-06T10:00:01.000Z')
    await a.capture('three', '2026-10-06T10:00:02.000Z')
    await a.engine.schedule()
    // Let page 1 through, then break on page 2.
    const realPull = relay.pull.bind(relay)
    let calls = 0
    relay.pull = async (since) => {
      calls += 1
      if (calls === 2) throw new Error('midway')
      return realPull(since)
    }
    await b.engine.schedule()
    expect(b.engine.getStatus()).toBe('offline')
    expect((await b.texts()).length).toBe(2)
    relay.pull = realPull
    await b.engine.schedule()
    expect(await b.texts()).toEqual(['three', 'two', 'one'])
  })

  it('an older remote row never overwrites a newer local one, which stays queued (criterion 8)', async () => {
    const relay = new FakeRelay()
    const a = device(fresh(), relay)
    const b = device(fresh(), relay)
    const id = crypto.randomUUID()
    await a.capture('older', '2026-10-06T10:00:00.000Z', id)
    await a.engine.schedule()
    await b.capture('newer', '2026-10-06T10:00:05.000Z', id)
    // Apply the remote page directly, as a pull that happens before B's own push would.
    const bStore = dexieStore(b.d)
    const page = await relay.pull(null)
    await bStore.applyRemote(page.rows.map(toThought))
    expect(await b.texts()).toEqual(['newer'])
    expect(await b.d.outbox.count()).toBe(1)
  })

  it('reports local when no relay is set (criterion 4)', async () => {
    const d = createKerixDb(fresh())
    const engine = new SyncEngine(dexieStore(d), () => true)
    expect(engine.getStatus()).toBe('local')
    await engine.schedule()
    expect(engine.getStatus()).toBe('local')
  })

  it('does not clear an outbox entry that changed during the push (store invariant)', async () => {
    const relay = new FakeRelay()
    const a = device(fresh(), relay)
    const id = crypto.randomUUID()
    await a.capture('v1', '2026-10-06T10:00:00.000Z', id)
    const realPush = relay.push.bind(relay)
    relay.push = async (rows) => {
      await realPush(rows)
      await a.capture('v2', '2026-10-06T10:00:09.000Z', id) // local change while the push is in flight
    }
    await a.engine.schedule()
    expect(await a.d.outbox.count()).toBe(1)
    expect(relay.rows.get(id)?.text).toBe('v1')
    relay.push = realPush
    await a.engine.schedule()
    expect(relay.rows.get(id)?.text).toBe('v2')
    expect(await a.d.outbox.count()).toBe(0)
  })
})
