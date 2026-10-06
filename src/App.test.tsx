import { render, screen } from '@testing-library/react'
import App from './App'

describe('App shell', () => {
  it('shows the herald', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'KERIX' })).toBeInTheDocument()
  })
})
