import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { countAll } from '../../data/thoughts'
import { Seam } from '../../ui/Seam'
import { readDismissedOn, shouldOffer, today, writeDismissedOn } from './syncPrompt'

/** One quiet slab under the capture bar, shown by the progressive-disclosure rule. */
export function SyncPrompt({ configured, signedIn, onSignIn }: { configured: boolean; signedIn: boolean; onSignIn: () => void }) {
  const count = useLiveQuery(countAll, [], 0)
  const [dismissedOn, setDismissedOn] = useState<string | null>(readDismissedOn)

  const visible = shouldOffer({ configured, signedIn, thoughtCount: count, dismissedOn, today: today() })
  if (!visible) return null

  function dismiss() {
    const day = today()
    writeDismissedOn(day)
    setDismissedOn(day)
  }

  return (
    <aside aria-label="Keep your thoughts everywhere" className="mt-2.5 overflow-hidden rounded-[10px] border border-slab-line bg-slab">
      <Seam glintAt={3} />
      <div className="flex items-center gap-3 py-2.5 pr-1.5 pl-4">
        <p className="min-w-0 flex-1 font-thought text-lg leading-tight text-ink">Keep this everywhere you are.</p>
        <button type="button" onClick={onSignIn} className="h-11 shrink-0 rounded-lg px-3 font-display text-[11px] tracking-[0.2em] text-gold-ink">
          SIGN IN
        </button>
        <button type="button" onClick={dismiss} aria-label="Not now" className="flex size-11 shrink-0 items-center justify-center text-mute">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </aside>
  )
}
