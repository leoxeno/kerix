import { render, screen } from '@testing-library/react'
import { db } from '../../data/db'
import { addThought } from '../../data/thoughts'
import { Inbox } from './Inbox'

beforeEach(() => db.thoughts.clear())

describe('Inbox (spec 001)', () => {
  it('asks the Oracle question when empty and shows no slabs (criterion 6)', async () => {
    render(<Inbox />)
    expect(await screen.findByText('What is on your mind?')).toBeInTheDocument()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('lists open thoughts newest first (criterion 3)', async () => {
    await addThought({ text: 'A' })
    await addThought({ text: 'B' })
    render(<Inbox />)
    const items = await screen.findAllByRole('listitem')
    expect(items.map((li) => li.textContent)).toEqual([
      expect.stringContaining('B'),
      expect.stringContaining('A'),
    ])
    expect(items[0]).toHaveTextContent('this device')
  })
})
