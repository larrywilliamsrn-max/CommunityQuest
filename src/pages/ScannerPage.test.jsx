import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ScannerPage from './ScannerPage'

describe('ScannerPage', () => {
  it('captures a scanned quest and shows the reward', () => {
    render(<ScannerPage />)

    fireEvent.click(screen.getByRole('button', { name: /Scan Quest/i }))

    expect(screen.getByText(/Quest scanned successfully/i)).toBeInTheDocument()
    expect(screen.getByText(/30/i)).toBeInTheDocument()
  })
})
