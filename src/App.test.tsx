import { render, screen } from '@testing-library/react'
import App from './App'

describe('App shell', () => {
  it('shows the herald and the oracle question', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'KERIX' })).toBeInTheDocument()
    expect(screen.getByText('What is on your mind?')).toBeInTheDocument()
  })

  it('exposes the capture field and save button to assistive tech', () => {
    render(<App />)
    expect(screen.getByLabelText('Capture a thought')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save thought' })).toBeInTheDocument()
  })
})
