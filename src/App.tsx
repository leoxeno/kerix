import { Capture } from './features/capture/Capture'
import { Inbox } from './features/inbox/Inbox'
import { Seam } from './ui/Seam'

export default function App() {
  return (
    <main className="mx-auto flex h-full w-full max-w-md flex-col px-6">
      <header className="flex flex-col gap-4 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-semibold tracking-[0.24em] text-ink">KERIX</h1>
          <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] text-cyan-ink">
            <span className="inline-block size-1.5 rounded-full bg-cyan shadow-glow" aria-hidden="true" />
            LOCAL
          </div>
        </div>
        <Seam glintAt={1} />
      </header>

      <section className="min-h-0 flex-1 overflow-y-auto pb-4">
        <Inbox />
      </section>

      <footer className="sticky bottom-0 bg-ground pt-2 pb-7">
        <Capture />
      </footer>
    </main>
  )
}
