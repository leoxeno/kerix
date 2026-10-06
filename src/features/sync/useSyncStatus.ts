import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import type { SyncStatus } from '../../sync/engine'
import { engine, startSync, stopSync } from '../../sync/runtime'
import { supabase } from '../../sync/supabase'

/** Starts or stops the sync runtime as the session comes and goes, and exposes the engine's status to the UI. */
export function useSyncStatus(session: Session | null): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>(engine.getStatus())

  useEffect(() => engine.subscribe(setStatus), [])

  useEffect(() => {
    if (supabase && session) startSync(supabase, session.user.id)
    else stopSync()
  }, [session])

  return status
}

export const STATUS_LABEL: Record<SyncStatus, string> = {
  local: 'LOCAL',
  offline: 'OFFLINE',
  syncing: 'SYNCING',
  synced: 'SYNCED',
}
