import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

type AuthCallback = (event: string, session: unknown) => void

// The relay is off by default, so the shell tests run local only. The criterion 10 test switches it on.
const relay = vi.hoisted(() => {
  const state: { client: unknown; authCallback: ((event: string, session: unknown) => void) | null } = { client: null, authCallback: null }
  const chain: Record<string, unknown> = {}
  const query = () => {
    const q: Record<string, unknown> = {}
    for (const m of ['select', 'order', 'limit', 'gt', 'upsert']) q[m] = () => q
    q.then = (resolve: (v: unknown) => void) => resolve({ data: [], error: null })
    return q
  }
  chain.on = () => chain
  chain.subscribe = () => chain
  chain.unsubscribe = vi.fn()
  state.client = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: (cb: (event: string, session: unknown) => void) => {
        state.authCallback = cb
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      },
    },
    channel: () => chain,
    from: query,
  }
  return { state, enabled: { on: false } }
})

vi.mock('./sync/supabase', () => ({
  get supabase() {
    return relay.enabled.on ? relay.state.client : null
  },
  get syncConfigured() {
    return relay.enabled.on
  },
}))

describe('App shell', () => {
  it('shows the herald', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'KERIX' })).toBeInTheDocument()
  })

  it('reads LOCAL and never offers sign-in when no relay is configured (spec 002 criterion 4)', async () => {
    render(<App />)
    expect(screen.getByText('LOCAL')).toBeInTheDocument()
    expect(await screen.findByText('What is on your mind?')).toBeInTheDocument()
    expect(screen.queryByText('Keep this everywhere you are.')).not.toBeInTheDocument()
  })
})

describe('App sign-in sheet (spec 002 criterion 10)', () => {
  beforeEach(() => {
    relay.enabled.on = true
  })
  afterEach(() => {
    relay.enabled.on = false
  })

  it('closes by itself when a session appears from another source', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(await screen.findByRole('button', { name: /^Sync status/ }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    const session = { user: { id: 'u1', email: 'you@example.com' }, access_token: 'x' }
    act(() => (relay.state.authCallback as AuthCallback)('SIGNED_IN', session))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 2000 })
    expect(await screen.findByText('SYNCED')).toBeInTheDocument()
  })
})
