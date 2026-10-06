import { render, screen } from '@testing-library/react'
import App from './App'

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
