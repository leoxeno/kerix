const KEY = 'kerix.device'

let cached: string | null = null

/** A short random id created once per install. Survives in localStorage; falls back to a per-session id if storage is unavailable. */
export function getDeviceId(): string {
  if (cached) return cached
  try {
    const stored = localStorage.getItem(KEY)
    if (stored) return (cached = stored)
    const fresh = crypto.randomUUID().slice(0, 8)
    localStorage.setItem(KEY, fresh)
    return (cached = fresh)
  } catch {
    return (cached = crypto.randomUUID().slice(0, 8))
  }
}
