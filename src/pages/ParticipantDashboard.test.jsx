import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ParticipantDashboard from './ParticipantDashboard'

describe('ParticipantDashboard', () => {
  it('updates the dashboard after scanning a quest QR', () => {
    render(<ParticipantDashboard />)

    fireEvent.click(screen.getByRole('button', { name: /Scan AI Booth QR/i }))

    expect(screen.getByText(/Quest completed — you earned 30 XP and 20 tokens/i)).toBeInTheDocument()
    expect(screen.getByText(/Quest completed — you unlocked the next clue./i)).toBeInTheDocument()
  })
})
