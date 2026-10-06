export type AuthErrorContext = 'send' | 'check'

interface AuthErrorLike {
  message: string
  status?: number
  code?: string
}

/** Supabase answers a wrong code and a spent one with the same 403. */
export function isSpentCode(err: AuthErrorLike): boolean {
  return err.status === 403 || err.code === 'otp_expired' || /expired|invalid/i.test(err.message)
}

/** Product words for a sign-in failure. The server's own message is logged, never shown (spec 002). */
export function describeAuthError(err: AuthErrorLike, context: AuthErrorContext): string {
  console.error('auth error', err)
  if (context === 'check' && isSpentCode(err)) return 'That code did not work: mistyped, already used, or expired.'
  const wait = /after (\d+) seconds/.exec(err.message)
  if (wait) return `Wait ${wait[1]} seconds, then ask for a new code.`
  if (context === 'send' && /invalid.*email|email.*invalid/i.test(err.message)) return 'That does not look like an email address.'
  return context === 'send' ? 'The code could not be sent. Try again in a moment.' : 'The code could not be checked. Try again in a moment.'
}
