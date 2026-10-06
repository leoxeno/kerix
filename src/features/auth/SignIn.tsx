import { useEffect, useRef, useState, type FormEvent } from 'react'
import { supabase } from '../../sync/supabase'
import { Seam } from '../../ui/Seam'
import { describeAuthError, isSpentCode } from './errorCopy'

type Step = 'email' | 'code'

/** The Oracle asks who speaks. Email, then the six-digit code from the email. Full-screen sheet. */
export function SignIn({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState<'checking' | 'sending' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [spent, setSpent] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [refocusResend, setRefocusResend] = useState(false)
  const codeRef = useRef<HTMLInputElement>(null)
  const resendRef = useRef<HTMLButtonElement>(null)

  // After a failed resend, return focus to the button once it is enabled again.
  useEffect(() => {
    if (refocusResend && busy === null) {
      resendRef.current?.focus()
      setRefocusResend(false)
    }
  }, [refocusResend, busy])

  if (!supabase) return null
  const auth = supabase.auth

  async function requestCode() {
    const address = email.trim()
    if (!address) return
    setBusy('sending')
    setError(null)
    setSpent(false)
    setNotice(null)
    const { error: err } = await auth.signInWithOtp({ email: address, options: { shouldCreateUser: true } })
    setBusy(null)
    if (err) {
      setError(describeAuthError(err, 'send'))
      return
    }
    setStep('code')
  }

  function sendCode(event: FormEvent) {
    event.preventDefault()
    void requestCode()
  }

  async function sendNewCode() {
    setBusy('sending')
    setNotice(null)
    const { error: err } = await auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } })
    setBusy(null)
    if (err) {
      setError(describeAuthError(err, 'send'))
      setRefocusResend(true)
      return
    }
    setCode('')
    setError(null)
    setSpent(false)
    setNotice('A new code is on its way.')
    codeRef.current?.focus()
  }

  function changeEmail() {
    setStep('email')
    setCode('')
    setError(null)
    setSpent(false)
    setNotice(null)
  }

  async function verify(event: FormEvent) {
    event.preventDefault()
    const token = code.replace(/\D/g, '')
    if (token.length !== 6) return
    setBusy('checking')
    setError(null)
    setSpent(false)
    setNotice(null)
    const { error: err } = await auth.verifyOtp({ email: email.trim(), token, type: 'email' })
    setBusy(null)
    if (err) {
      setSpent(isSpentCode(err))
      setError(describeAuthError(err, 'check'))
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
            <button type="submit" disabled={busy !== null} className="h-12 rounded-full border border-gold bg-surface px-7 font-display text-xs tracking-[0.22em] text-gold-ink shadow-lift disabled:opacity-60">
              {busy === 'sending' ? 'SENDING' : 'SEND CODE'}
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
              ref={codeRef}
              value={code}
              onChange={(e) => {
                setNotice(null)
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
              }}
              placeholder="······"
              className="h-14 w-48 border-b border-gold bg-transparent text-center font-mono text-3xl tracking-[0.4em] text-ink outline-none placeholder:text-mute"
            />
            <p role="status" aria-live="polite" className="min-h-5 font-body text-sm text-mute">
              {notice}
            </p>
            <button type="submit" disabled={busy !== null || code.length !== 6} className="h-12 rounded-full border border-gold bg-surface px-7 font-display text-xs tracking-[0.22em] text-gold-ink shadow-lift disabled:opacity-60">
              {busy === 'checking' ? 'CHECKING' : 'ENTER'}
            </button>
            <button type="button" onClick={changeEmail} disabled={busy !== null} className="h-11 font-mono text-[11px] tracking-[0.08em] text-mute disabled:opacity-60">
              different email
            </button>
          </form>
        )}
        {error && (
          <p role="alert" className="max-w-xs font-mono text-[11px] text-gold-ink">
            {error}
          </p>
        )}
        {spent && (
          <button type="button" ref={resendRef} onClick={() => void sendNewCode()} disabled={busy !== null} className="h-11 font-display text-xs tracking-[0.22em] text-gold-ink disabled:opacity-60">
            {busy === 'sending' ? 'SENDING' : 'SEND A NEW ONE'}
          </button>
        )}
      </section>
    </div>
  )
}
