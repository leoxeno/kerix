import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'
import { db } from '../data/db'
import { SyncEngine } from './engine'
import { dexieStore } from './store'
import { supabaseRelay } from './supabaseRelay'
import { attachTriggers } from './triggers'

/** One engine for the app, over the app's database. Status is 'local' until startSync is called. */
export const engine = new SyncEngine(dexieStore(db))

let detach: (() => void) | null = null
let channel: RealtimeChannel | null = null

/** Called when a session exists. Idempotent. */
export function startSync(client: SupabaseClient, userId: string): void {
  if (detach) return
  engine.setRelay(supabaseRelay(client))
  detach = attachTriggers(engine, db)
  channel = client
    .channel('thoughts-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'thoughts', filter: `user_id=eq.${userId}` },
      () => void engine.schedule(),
    )
    .subscribe()
}

/** Called on sign-out or when no session exists. Local data is untouched. */
export function stopSync(): void {
  channel?.unsubscribe()
  channel = null
  detach?.()
  detach = null
  engine.setRelay(null)
}
