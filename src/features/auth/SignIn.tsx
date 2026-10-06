import { useState, type FormEvent } from 'react'
import { supabase } from '../../sync/supabase'
import { Seam } from '../../ui/Seam'

type Step = 'email' | 'code'

/** The Oracle asks who speaks. Email, then the six-digit code from the email. Full-screen sheet. */
export function SignIn({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!supabase) return null
  const auth = supabase.auth

  async function sendCode(event: FormEvent) {
    event.preventDefault()
    const address = email.trim()
    if (!address) return
    setBusy(true)
    setError(null)
    const { error: err } = await auth.signInWithOtp({ email: address, options: { shouldCreateUser: true } })
    setBusy(false)
    if (err) {
      setError(err.message)
      return
    }
    setStep('code')
  }

  async function verify(event: FormEvent) {
    event.preventDefault()
    const token = code.replace(/\D/g, '')
    if (token.length !== 6) return
    setBusy(true)
    setError(null)
    const { error: err } = await auth.verifyOtp({ email: email.trim(), token, type: 'email' })
    setBusy(false)
    if (err) {
      setError(err.message)
      return
    }
    onClose()
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="signin-title" className="fixed inset-0 z-20 flex flex-col bg-ground px-6">
      <header className="flex items-center justify-between pt-14 pb-4">
        <p className="font-display text-[11px] tracking-[0.3em] text-gold-ink">THE ORACLE ASKS</p>
        <button type="button" onClick={onClose} aria-label="Close" className="flex size-11 items-center justify-center text-mute">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>
      <Seam glintAt={0} />

      <section className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        {step === 'email' ? (
          <form onSubmit={sendCode} className="flex w-full max-w-xs flex-col items-center gap-5">
            <h2 id="signin-title" className="font-thought text-4xl italic leading-tight text-ink">
              Who speaks?
            </h2>
            <p className="font-body text-sm text-mute">Your email. A six-digit code comes back. No password, ever.</p>
            <label htmlFor="signin-email" className="sr-only">
              Email
            </label>
            <input
              id="signin-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@somewhere"
              className="h-12 w-full border-b border-gold bg-transparent text-center font-body text-lg text-ink outline-none placeholder:text-mute"
            />
            <button type="submit" disabled={busy} className="h-12 rounded-full border border-gold bg-surface px-7 font-display text-xs tracking-[0.22em] text-gold-ink shadow-lift disabled:opacity-60">
              {busy ? 'SENDING' : 'SEND CODE'}
            </button>
          </form>
        ) : (
          <form onSubmit={verify} className="flex w-full max-w-xs flex-col items-center gap-5">
            <h2 id="signin-title" className="font-thought text-4xl italic leading-tight text-ink">
              The code
            </h2>
            <p className="font-body text-sm text-mute">Sent to {email.trim()}. Six digits.</p>
            <label htmlFor="signin-code" className="sr-only">
              Six-digit code
            </label>
            <input
              id="signin-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              autoFocus
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="······"
              className="h-14 w-48 border-b border-gold bg-transparent text-center font-mono text-3xl tracking-[0.4em] text-ink outline-none placeholder:text-mute"
            />
            <button type="submit" disabled={busy || code.length !== 6} className="h-12 rounded-full border border-gold bg-surface px-7 font-display text-xs tracking-[0.22em] text-gold-ink shadow-lift disabled:opacity-60">
              {busy ? 'CHECKING' : 'ENTER'}
            </button>
            <button type="button" onClick={() => setStep('email')} className="h-11 font-mono text-[11px] tracking-[0.08em] text-mute">
              different email
            </button>
          </form>
        )}
        {error && (
          <p role="alert" className="max-w-xs font-mono text-[11px] text-gold-ink">
            {error}
          </p>
        )}
      </section>
    </div>
  )
}
