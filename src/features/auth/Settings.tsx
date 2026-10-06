import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../sync/supabase'
import { Seam } from '../../ui/Seam'

/** Behind the header mark. Shows who is signed in and offers sign-out. Signing out keeps local thoughts. */
export function Settings({ session, onClose }: { session: Session; onClose: () => void }) {
  async function signOut() {
    await supabase?.auth.signOut({ scope: 'local' })
    onClose()
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="settings-title" className="fixed inset-0 z-20 flex flex-col bg-ground px-6">
      <header className="flex items-center justify-between pt-14 pb-4">
        <h2 id="settings-title" className="font-display text-[11px] tracking-[0.3em] text-gold-ink">
          THIS DEVICE
        </h2>
        <button type="button" onClick={onClose} aria-label="Close" className="flex size-11 items-center justify-center text-mute">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>
      <Seam glintAt={1} />
      <section className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <p className="font-thought text-3xl italic leading-tight text-ink">Speaking as</p>
        <p className="font-body text-base text-ink">{session.user.email}</p>
        <p className="max-w-xs font-body text-sm text-mute">Signing out stops syncing on this device. The thoughts already here stay here.</p>
        <button type="button" onClick={signOut} className="h-12 rounded-full border border-gold bg-surface px-7 font-display text-xs tracking-[0.22em] text-gold-ink shadow-lift">
          SIGN OUT
        </button>
      </section>
    </div>
  )
}
