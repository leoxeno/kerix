const KEY = 'kerix.syncPrompt.dismissedOn'

/** Calendar day in local time, so "a later day" means what a person means. */
export function today(now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Progressive disclosure rule (spec 002): offer sign-in only when a relay exists, the person is signed out,
 * there is at least one thought worth keeping, and the offer was not dismissed today.
 */
export function shouldOffer(input: {
  configured: boolean
  signedIn: boolean
  thoughtCount: number
  dismissedOn: string | null
  today: string
}): boolean {
  if (!input.configured || input.signedIn) return false
  if (input.thoughtCount === 0) return false
  return input.dismissedOn !== input.today
}

export function readDismissedOn(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function writeDismissedOn(day: string): void {
  try {
    localStorage.setItem(KEY, day)
  } catch {
    // storage unavailable: the prompt simply shows again next time
  }
}
