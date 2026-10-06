import { useState } from 'react'
import { Settings } from './features/auth/Settings'
import { SignIn } from './features/auth/SignIn'
import { SyncPrompt } from './features/auth/SyncPrompt'
import { useSession } from './features/auth/useSession'
import { Capture } from './features/capture/Capture'
import { Inbox } from './features/inbox/Inbox'
import { STATUS_LABEL, useSyncStatus } from './features/sync/useSyncStatus'
import { syncConfigured } from './sync/supabase'
import { Seam } from './ui/Seam'

type Sheet = 'none' | 'signin' | 'settings'

export default function App() {
  const { session } = useSession()
  const status = useSyncStatus(session)
  const [sheet, setSheet] = useState<Sheet>('none')

  const dot =
    status === 'synced' || status === 'syncing'
      ? 'bg-cyan shadow-glow'
      : status === 'offline'
        ? 'bg-gold'
        : 'bg-mute'

  return (
    <main className="mx-auto flex h-full w-full max-w-md flex-col px-6">
      <header className="flex flex-col gap-4 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-semibold tracking-[0.24em] text-ink">KERIX</h1>
          <button
            type="button"
            onClick={() => setSheet(session ? 'settings' : 'signin')}
            disabled={!syncConfigured}
            aria-label={session ? `Sync status ${STATUS_LABEL[status]}, open settings` : `Sync status ${STATUS_LABEL[status]}, sign in`}
            className="flex h-11 items-center gap-2 font-mono text-[11px] tracking-[0.08em] text-cyan-ink disabled:cursor-default"
          >
            <span className={`inline-block size-1.5 rounded-full ${dot}`} aria-hidden="true" />
            {STATUS_LABEL[status]}
          </button>
        </div>
        <Seam glintAt={1} />
      </header>

      <section className="min-h-0 flex-1 overflow-y-auto pb-4">
        <Inbox />
      </section>

      <footer className="sticky bottom-0 bg-ground pt-2 pb-7">
        <Capture />
        <SyncPrompt configured={syncConfigured} signedIn={session !== null} onSignIn={() => setSheet('signin')} />
      </footer>

      {sheet === 'signin' && <SignIn onClose={() => setSheet('none')} />}
      {sheet === 'settings' && session && <Settings session={session} onClose={() => setSheet('none')} />}
    </main>
  )
}
