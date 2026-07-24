import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('QuestChain app', () => {
  it('renders the landing experience', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /Turn every event moment into a quest worth completing/i })).toBeInTheDocument()
    expect(screen.getByText(/Enter as Participant/i)).toBeInTheDocument()
  })
})
