import { Seam } from './app/Seam'

/**
 * Kerix shell. Version 0.1: the frame, the empty state, nothing behind it yet.
 * Capture lands in the next commit (see docs/PRODUCT.md for the build order).
 */
export default function App() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col px-6">
      <header className="flex flex-col gap-4 pt-14">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-semibold tracking-[0.24em] text-ink">KERIX</h1>
          <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] text-cyan-ink">
            <span className="inline-block size-1.5 rounded-full bg-cyan shadow-glow" aria-hidden="true" />
            LOCAL
          </div>
        </div>
        <Seam glintAt={1} />
      </header>

      <section className="flex flex-1 flex-col items-center justify-center gap-5 py-16 text-center">
        <p className="font-display text-[11px] tracking-[0.3em] text-gold-ink">THE ORACLE ASKS</p>
        <p className="font-thought text-4xl italic leading-tight text-ink">What is on your mind?</p>
        <p className="max-w-xs font-body text-sm text-mute">
          Write it down. It will be everywhere you are.
        </p>
      </section>

      <footer className="pb-7">
        <div className="overflow-hidden rounded-[10px] border border-gold bg-surface shadow-lift">
          <Seam glintAt={2} thick />
          <div className="flex items-center gap-2 py-1.5 pr-1.5 pl-4">
            <input
              type="text"
              aria-label="Capture a thought"
              placeholder="A thought, wherever you are…"
              className="h-11 min-w-0 flex-1 bg-transparent font-body text-base text-ink outline-none placeholder:text-mute"
              disabled
            />
            <button
              type="button"
              aria-label="Save thought"
              className="flex size-11 items-center justify-center rounded-lg bg-gold text-ground"
              disabled
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 19V5" />
                <path d="M6 11l6-6 6 6" />
              </svg>
            </button>
          </div>
        </div>
      </footer>
    </main>
  )
}
