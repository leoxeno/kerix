import { useState, type FormEvent } from 'react'
import { addThought } from '../../data/thoughts'
import { Seam } from '../../ui/Seam'

/** The capture slab. Enter or the button saves; blank text does nothing and leaves the field as it is. */
export function CaptureSlab({ onCapture }: { onCapture: (text: string) => void | Promise<unknown> }) {
  const [text, setText] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    await onCapture(trimmed)
    setText('')
  }

  return (
    <form onSubmit={submit} className="overflow-hidden rounded-[10px] border border-gold bg-surface shadow-lift">
      <Seam glintAt={2} thick />
      <div className="flex items-center gap-2 py-1.5 pr-1.5 pl-4">
        <label htmlFor="capture" className="sr-only">
          Capture a thought
        </label>
        <input
          id="capture"
          type="text"
          autoFocus
          autoComplete="off"
          enterKeyHint="send"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="A thought, wherever you are…"
          className="h-11 min-w-0 flex-1 bg-transparent font-body text-base text-ink outline-none placeholder:text-mute"
        />
        <button
          type="submit"
          aria-label="Save thought"
          className="flex size-11 items-center justify-center rounded-lg bg-gold text-ground"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 19V5" />
            <path d="M6 11l6-6 6 6" />
          </svg>
        </button>
      </div>
    </form>
  )
}

/** CaptureSlab wired to the repository. */
export function Capture() {
  return <CaptureSlab onCapture={(text) => addThought({ text })} />
}
