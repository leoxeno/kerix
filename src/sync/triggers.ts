import { liveQuery } from 'dexie'
import type { KerixDb } from '../data/db'
import type { SyncEngine } from './engine'

const WRITE_DEBOUNCE_MS = 500
const HEARTBEAT_MS = 60_000

/**
 * Browser events that should start a sync cycle: coming online, the tab becoming visible,
 * a local write landing in the outbox (debounced), and a heartbeat while visible.
 * Returns a function that detaches everything.
 */
export function attachTriggers(engine: SyncEngine, d: KerixDb): () => void {
  const kick = () => void engine.schedule()

  const onVisible = () => {
    if (document.visibilityState === 'visible') kick()
  }
  window.addEventListener('online', kick)
  document.addEventListener('visibilitychange', onVisible)

  const heartbeat = window.setInterval(() => {
    if (document.visibilityState === 'visible') kick()
  }, HEARTBEAT_MS)

  let debounce: number | undefined
  const outbox = liveQuery(() => d.outbox.count()).subscribe({
    next: (count) => {
      if (count === 0) return
      window.clearTimeout(debounce)
      debounce = window.setTimeout(kick, WRITE_DEBOUNCE_MS)
    },
  })

  kick()

  return () => {
    window.removeEventListener('online', kick)
    document.removeEventListener('visibilitychange', onVisible)
    window.clearInterval(heartbeat)
    window.clearTimeout(debounce)
    outbox.unsubscribe()
  }
}
