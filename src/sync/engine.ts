import { toThought, type Relay } from './relay'
import type { LocalStore } from './store'

export type SyncStatus = 'local' | 'offline' | 'syncing' | 'synced'

/**
 * Push the outbox, then pull what changed. Pure TypeScript, no React, no browser globals
 * beyond an injectable `isOnline`. Cycles never overlap; a request during a cycle runs one more.
 */
export class SyncEngine {
  private relay: Relay | null = null
  private status: SyncStatus = 'local'
  private listeners = new Set<(s: SyncStatus) => void>()
  private loop: Promise<void> | null = null
  private pending = false
  private readonly store: LocalStore
  private readonly isOnline: () => boolean

  constructor(store: LocalStore, isOnline?: () => boolean) {
    this.store = store
    this.isOnline = isOnline ?? (() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  }

  /** A relay means a signed-in user. Null means local only. */
  setRelay(relay: Relay | null): void {
    this.relay = relay
    if (!relay) {
      this.set('local')
      return
    }
    void this.schedule()
  }

  getStatus(): SyncStatus {
    return this.status
  }

  subscribe(listener: (s: SyncStatus) => void): () => void {
    this.listeners.add(listener)
    listener(this.status)
    return () => this.listeners.delete(listener)
  }

  /** Ask for a cycle. Resolves when the work requested by this call has finished, even if a cycle was already running. */
  schedule(): Promise<void> {
    if (!this.relay) return Promise.resolve()
    if (this.loop) {
      this.pending = true
      return this.loop
    }
    this.loop = (async () => {
      try {
        do {
          this.pending = false
          await this.cycle()
        } while (this.pending)
      } finally {
        this.loop = null
      }
    })()
    return this.loop
  }

  private set(status: SyncStatus): void {
    if (status === this.status) return
    this.status = status
    for (const l of this.listeners) l(status)
  }

  private async cycle(): Promise<void> {
    const relay = this.relay
    if (!relay) return
    if (!this.isOnline()) {
      this.set('offline')
      return
    }
    this.set('syncing')
    try {
      await this.push(relay)
      await this.pull(relay)
      const left = await this.store.outboxIds()
      this.set(left.length === 0 ? 'synced' : 'offline')
    } catch {
      this.set('offline')
    }
  }

  private async push(relay: Relay): Promise<void> {
    const ids = await this.store.outboxIds()
    if (ids.length === 0) return
    const rows = await this.store.getThoughts(ids)
    if (rows.length === 0) return
    await relay.push(rows)
    await this.store.clearOutbox(rows.map((r) => ({ id: r.id, updatedAt: r.updatedAt })))
  }

  private async pull(relay: Relay): Promise<void> {
    let cursor = await this.store.getCursor()
    for (;;) {
      const page = await relay.pull(cursor)
      if (page.rows.length === 0) return
      await this.store.applyRemote(page.rows.map(toThought))
      if (!page.cursor) return
      await this.store.setCursor(page.cursor)
      cursor = page.cursor
    }
  }
}
