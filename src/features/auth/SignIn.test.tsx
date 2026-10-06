import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describeAuthError } from './errorCopy'
import { SignIn } from './SignIn'

const { signInWithOtp, verifyOtp } = vi.hoisted(() => ({ signInWithOtp: vi.fn(), verifyOtp: vi.fn() }))

vi.mock('../../sync/supabase', () => ({
  supabase: { auth: { signInWithOtp, verifyOtp } },
  syncConfigured: true,
}))

async function reachCodeStep() {
  const user = userEvent.setup()
  render(<SignIn onClose={() => {}} />)
  await user.type(screen.getByLabelText('Email'), 'you@example.com')
  await user.click(screen.getByRole('button', { name: 'SEND CODE' }))
  await screen.findByLabelText('Six-digit code')
  return user
}

// The helper logs every raw server error once; keep that out of the test output for the whole file.
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('describeAuthError (the server message is never shown raw)', () => {
  it.each([
    ['check', { message: 'x', status: 403 }, 'That code did not work: mistyped, already used, or expired.'],
    ['check', { message: 'For security purposes, you can only request this after 42 seconds.', status: 429 }, 'Wait 42 seconds, then ask for a new code.'],
    ['send', { message: 'For security purposes, you can only request this after 7 seconds.', status: 429 }, 'Wait 7 seconds, then ask for a new code.'],
    ['send', { message: 'Unable to validate email address: invalid format', status: 400 }, 'That does not look like an email address.'],
    ['send', { message: 'boom', status: 500 }, 'The code could not be sent. Try again in a moment.'],
    ['check', { message: 'boom', status: 500 }, 'The code could not be checked. Try again in a moment.'],
  ] as const)('%s %j', (context, err, expected) => {
    expect(describeAuthError(err, context)).toBe(expected)
  })
})

describe('SignIn code step (spec 002)', () => {
  beforeEach(() => {
    signInWithOtp.mockReset().mockResolvedValue({ error: null })
    verifyOtp.mockReset()
  })

  const COPY = 'That code did not work: mistyped, already used, or expired.'
  const RAW = 'Server said no'

  async function enterCode(user: Awaited<ReturnType<typeof reachCodeStep>>) {
    await user.type(screen.getByLabelText('Six-digit code'), '123456')
    await user.click(screen.getByRole('button', { name: 'ENTER' }))
  }

  it.each([
    ['status 403 only', { message: RAW, status: 403 }],
    ['code otp_expired only', { message: RAW, status: 400, code: 'otp_expired' }],
    ['message matching expired or invalid only', { message: 'Token has expired or is invalid', status: 400 }],
  ])('treats %s as a spent code and hides the raw message (criterion 11)', async (_name, error) => {
    verifyOtp.mockResolvedValue({ error })
    const user = await reachCodeStep()
    await enterCode(user)

    expect(await screen.findByRole('alert')).toHaveTextContent(new RegExp(`^${COPY}$`))
    expect(screen.queryByText(error.message)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'SEND A NEW ONE' })).toBeInTheDocument()
  })

  it('sends a new code, clears the error, focuses the field and announces it (criterion 11)', async () => {
    verifyOtp.mockResolvedValue({ error: { message: RAW, status: 403 } })
    const user = await reachCodeStep()
    await enterCode(user)
    await user.click(await screen.findByRole('button', { name: 'SEND A NEW ONE' }))

    expect(signInWithOtp).toHaveBeenCalledTimes(2)
    expect(signInWithOtp).toHaveBeenLastCalledWith({ email: 'you@example.com', options: { shouldCreateUser: true } })
    expect(screen.getByLabelText('Six-digit code')).toHaveValue('')
    expect(screen.getByLabelText('Six-digit code')).toHaveFocus()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('A new code is on its way.')
    expect(screen.queryByRole('button', { name: 'SEND A NEW ONE' })).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('Six-digit code'), '1')
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('answers a rate-limited resend in product words and keeps the offer', async () => {
    verifyOtp.mockResolvedValue({ error: { message: RAW, status: 403 } })
    const user = await reachCodeStep()
    await enterCode(user)
    const raw = 'For security purposes, you can only request this after 42 seconds.'
    signInWithOtp.mockResolvedValueOnce({ error: { message: raw, status: 429 } })
    await user.click(await screen.findByRole('button', { name: 'SEND A NEW ONE' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/^Wait 42 seconds, then ask for a new code\.$/)
    expect(screen.queryByText(raw)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'SEND A NEW ONE' })).toHaveFocus()
  })

  it('falls back to a generic line when a failed resend carries no wait time', async () => {
    verifyOtp.mockResolvedValue({ error: { message: RAW, status: 403 } })
    const user = await reachCodeStep()
    await enterCode(user)
    signInWithOtp.mockResolvedValueOnce({ error: { message: 'boom', status: 500 } })
    await user.click(await screen.findByRole('button', { name: 'SEND A NEW ONE' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('The code could not be sent. Try again in a moment.')
    expect(screen.queryByText('boom')).not.toBeInTheDocument()
  })

  it('clears the error, offer and code when the email is changed', async () => {
    verifyOtp.mockResolvedValue({ error: { message: RAW, status: 403 } })
    const user = await reachCodeStep()
    await enterCode(user)
    await screen.findByRole('alert')
    await user.click(screen.getByRole('button', { name: 'different email' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'SEND A NEW ONE' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'SEND CODE' }))
    expect(await screen.findByLabelText('Six-digit code')).toHaveValue('')
  })

  it('still shows the message of an unrelated error (boundary of criterion 11)', async () => {
    verifyOtp.mockResolvedValue({ error: { message: 'Network down', status: 500 } })
    const user = await reachCodeStep()
    await user.type(screen.getByLabelText('Six-digit code'), '123456')
    await user.click(screen.getByRole('button', { name: 'ENTER' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/^The code could not be checked\. Try again in a moment\.$/)
    expect(screen.queryByText('Network down')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'SEND A NEW ONE' })).not.toBeInTheDocument()
  })
})
