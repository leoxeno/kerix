import { useLiveQuery } from 'dexie-react-hooks'
import { listOpen } from '../../data/thoughts'
import { Diamond } from '../../ui/Diamond'
import { Slab } from '../../ui/Slab'
import { formatRelative } from '../../ui/relativeTime'

/** Open thoughts, newest first, as slabs. The Oracle asks when there are none. */
export function Inbox() {
  const thoughts = useLiveQuery(listOpen, [])

  if (thoughts === undefined) return null

  if (thoughts.length === 0) {
    return (
      <section className="flex h-full flex-col items-center justify-center gap-5 py-16 text-center">
        <p className="font-display text-[11px] tracking-[0.3em] text-gold-ink">THE ORACLE ASKS</p>
        <p className="font-thought text-4xl italic leading-tight text-ink">What is on your mind?</p>
        <p className="max-w-xs font-body text-sm text-mute">Write it down. It will be everywhere you are.</p>
      </section>
    )
  }

  return (
    <ul aria-label="Open thoughts" className="flex flex-col gap-2.5">
      {thoughts.map((t, i) => (
        <Slab key={t.id} index={i}>
          <Diamond disabled />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <p className="font-thought text-[22px] leading-[1.25] font-medium text-ink wrap-break-word">{t.text}</p>
            <p className="font-mono text-[11px] tracking-[0.04em] text-mute">
              {formatRelative(t.createdAt)} · this device
            </p>
          </div>
        </Slab>
      ))}
    </ul>
  )
}
