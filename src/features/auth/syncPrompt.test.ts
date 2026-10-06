import { shouldOffer, today } from './syncPrompt'

const base = { configured: true, signedIn: false, thoughtCount: 1, dismissedOn: null, today: '2026-10-06' }

describe('shouldOffer (progressive disclosure, spec 002)', () => {
  it('offers after the first thought when signed out and a relay exists', () => {
    expect(shouldOffer(base)).toBe(true)
  })
  it('never offers on an empty inbox', () => {
    expect(shouldOffer({ ...base, thoughtCount: 0 })).toBe(false)
  })
  it('never offers when signed in or when no relay is configured', () => {
    expect(shouldOffer({ ...base, signedIn: true })).toBe(false)
    expect(shouldOffer({ ...base, configured: false })).toBe(false)
  })
  it('stays away for the day it was dismissed and returns on a later day', () => {
    expect(shouldOffer({ ...base, dismissedOn: '2026-10-06' })).toBe(false)
    expect(shouldOffer({ ...base, dismissedOn: '2026-10-05' })).toBe(true)
  })
  it('formats today as a local calendar day', () => {
    expect(today(new Date(2026, 9, 6, 23, 30))).toBe('2026-10-06')
  })
})
