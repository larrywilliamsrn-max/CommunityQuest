import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import EventMapPage from './EventMapPage'

describe('EventMapPage', () => {
  it('reveals the next treasure clue after completing a booth quest', () => {
    render(<EventMapPage />)

    fireEvent.click(screen.getByRole('button', { name: /Complete AI Booth/i }))

    expect(screen.getByText(/Current clue/i)).toBeInTheDocument()
    expect(screen.getByText((_, node) => node?.textContent === 'The next clue is hidden where Cloud meets AI.' && node.tagName.toLowerCase() === 'p')).toBeInTheDocument()
    expect(screen.getAllByText(/Completed/i).length).toBeGreaterThan(0)
  })
})
