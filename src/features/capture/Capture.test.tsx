import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'
import { db } from '../../data/db'

beforeEach(() => db.thoughts.clear())

describe('Capture (spec 001)', () => {
  it('focuses the field on open and labels the controls (criteria 8, 9)', async () => {
    render(<App />)
    const input = screen.getByLabelText('Capture a thought')
    expect(input).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Save thought' })).toBeInTheDocument()
    expect(await screen.findByText('What is on your mind?')).toBeInTheDocument()
  })

  it('saves on Enter, shows the slab at the top, clears and keeps focus (criterion 1)', async () => {
    const user = userEvent.setup()
    render(<App />)
    const input = screen.getByLabelText('Capture a thought')
    await user.type(input, 'Buy olives{enter}')
    const items = await screen.findAllByRole('listitem')
    expect(items[0]).toHaveTextContent('Buy olives')
    expect(input).toHaveValue('')
    expect(input).toHaveFocus()
  })

  it('does nothing for whitespace and leaves the field unchanged (criterion 2)', async () => {
    const user = userEvent.setup()
    render(<App />)
    const input = screen.getByLabelText('Capture a thought')
    await user.type(input, '   {enter}')
    expect(await screen.findByText('What is on your mind?')).toBeInTheDocument()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(input).toHaveValue('   ')
    expect(await db.thoughts.count()).toBe(0)
  })
})
