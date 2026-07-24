import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import RewardsPage from './RewardsPage'

describe('RewardsPage', () => {
  it('redeems a reward and reduces token balance', () => {
    render(<RewardsPage />)

    fireEvent.click(screen.getByRole('button', { name: /Redeem Coffee Coupon/i }))

    expect(screen.getByText(/Coffee Coupon redeemed/i)).toBeInTheDocument()
    expect(screen.getByText((_, node) => node?.textContent === '160' && node.tagName.toLowerCase() === 'p')).toBeInTheDocument()
  })
})
