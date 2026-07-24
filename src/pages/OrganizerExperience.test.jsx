import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import OrganizerExperience from './OrganizerExperience'

describe('OrganizerExperience', () => {
  it('approves a participant and updates the live stats', () => {
    render(<OrganizerExperience />)

    fireEvent.click(screen.getByRole('button', { name: /Approve Maya/i }))

    expect(screen.getByText(/Approval sent to Maya/i)).toBeInTheDocument()
    expect(screen.getByText(/Active Booths/i)).toBeInTheDocument()
  })
})
