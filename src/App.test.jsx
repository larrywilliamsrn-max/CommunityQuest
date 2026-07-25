import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('QuestChain app', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.pushState({}, '', '/')
  })

  afterEach(() => {
    cleanup()
  })
  it('renders the landing experience', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /Turn attendance into engagement/i })).toBeInTheDocument()
    expect(screen.getByText(/Enter as Participant/i)).toBeInTheDocument()
  })

  it('routes the role buttons to a Google login experience', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /Enter as Participant/i }))

    expect(await screen.findByRole('heading', { name: /Sign in to continue/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign in with Google/i })).toBeInTheDocument()
  })

  it('renders the participant dashboard after signing in', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /Enter as Participant/i }))
    fireEvent.click(screen.getByRole('button', { name: /Continue as guest/i }))

    expect(await screen.findByRole('heading', { name: /Amina Okafor/i })).toBeInTheDocument()
    expect(screen.getByText(/Current level/i)).toBeInTheDocument()
  })

  it('shows a new-account prompt for organizer sign-in', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /Enter as Participant/i }))
    fireEvent.click(screen.getByRole('button', { name: /← Back to role selection/i }))
    fireEvent.click(screen.getByRole('button', { name: /Enter as Organizer/i }))

    expect(await screen.findByRole('heading', { name: /Sign in to continue/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Are you new here\?/i }))

    expect(screen.getByText(/Create a new account/i)).toBeInTheDocument()
  })

  it('marks a participant quest complete only after its link is clicked', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /Enter as Participant/i }))
    fireEvent.click(screen.getByRole('button', { name: /Continue as guest/i }))

    const questionLink = await screen.findByRole('link', { name: /Ask a Question/i })
    expect(within(questionLink).getByText(/Queued/i)).toBeInTheDocument()

    fireEvent.click(questionLink)

    const updatedQuestionLink = await screen.findByRole('link', { name: /Ask a Question/i })
    expect(within(updatedQuestionLink).getByText(/^Completed$/i)).toBeInTheDocument()
  })

  it('renders organizer quest overview items as links', () => {
    window.history.pushState({}, '', '/organizer')
    render(<App />)

    expect(screen.getByRole('link', { name: /Registration/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Keynote Attendance/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Treasure Hunt/i })).toBeInTheDocument()
  })

  it('routes the organizer create button to a quest form and updates the participant experience', async () => {
    window.history.pushState({}, '', '/organizer')
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /Create New Quest/i }))

    expect(await screen.findByRole('heading', { name: /Create a new quest/i })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/Event title/i), { target: { value: 'Community Glow Fair' } })
    fireEvent.change(screen.getByLabelText(/Event description/i), { target: { value: 'A vibrant night of art, tech, and neighborhood storytelling.' } })
    fireEvent.change(screen.getByLabelText(/Quest title/i), { target: { value: 'Glow Trail' } })
    fireEvent.change(screen.getByLabelText(/Quest summary/i), { target: { value: 'Discover the glow trail and unlock the hidden badge.' } })

    fireEvent.click(screen.getByRole('button', { name: /Publish quest/i }))

    expect(await screen.findByText(/Community Glow Fair/i)).toBeInTheDocument()
    expect(screen.getByText(/Discover the glow trail and unlock the hidden badge/i)).toBeInTheDocument()
  })
})
