import { useContext, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../AuthContext'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useContext(AuthContext)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [showNewAccountPrompt, setShowNewAccountPrompt] = useState(false)

  const selectedRole = location.state?.selectedRole ?? 'participant'

  const handleGoogleSignIn = () => {
    setIsSigningIn(true)

    window.setTimeout(() => {
      login(selectedRole)
      navigate(selectedRole === 'organizer' ? '/organizer' : '/participant')
    }, 600)
  }

  const handleGuestContinue = () => {
    login(selectedRole)
    navigate(selectedRole === 'organizer' ? '/organizer' : '/participant')
  }

  const isOrganizer = selectedRole === 'organizer'

  return (
    <section className="flex min-h-[70vh] items-center justify-center px-2 py-8">
      <div className="w-full max-w-xl rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] p-8 shadow-sm">
        <p className="inline-flex rounded-full bg-[rgba(34,197,94,0.12)] px-3 py-1 text-sm font-medium text-[var(--semantic-success)]">
          Secure access
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-[var(--text-primary)]">Sign in to continue</h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Continue with Google to enter the {selectedRole === 'organizer' ? 'organizer' : 'participant'} workspace.
        </p>

        <div className="mt-5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-base)] p-4 text-sm text-[var(--text-secondary)]">
          <p className="font-semibold text-[var(--text-primary)]">Selected workspace</p>
          <p className="mt-1 capitalize">{selectedRole} access</p>
        </div>

        {isOrganizer && (
          <div className="mt-5 rounded-xl border border-[var(--border-default)] bg-[rgba(59,130,246,0.08)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Are you new here?</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Set up your organizer account in a few quick steps.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewAccountPrompt(true)}
                className="rounded-full border border-[var(--border-default)] bg-white px-3 py-1 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface-base)]"
              >
                Are you new here?
              </button>
            </div>

            <div
              className={`mt-3 overflow-hidden rounded-lg border border-[var(--border-default)] bg-white transition-all duration-300 ${showNewAccountPrompt ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="p-4 text-sm text-[var(--text-secondary)]">
                <p className="font-semibold text-[var(--text-primary)]">Create a new account</p>
                <p className="mt-2">Use your Google account to start managing events, booths, and rewards.</p>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSigningIn}
          className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-inverted)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-80"
        >
          {isSigningIn ? (
            <span className="flex h-5 w-5 items-center justify-center">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.25" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          ) : (
            <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M21.6 12.23c0-.78-.07-1.53-.2-2.25H12v4.26h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.53Z" />
              <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.58A10 10 0 0 0 12 22Z" />
              <path fill="#FBBC05" d="M6.41 13.91A6.02 6.02 0 0 1 6.41 10.1V7.52H3.07a10 10 0 0 0 0 12.78l3.34-2.59Z" />
              <path fill="#EA4335" d="M12 5.98c1.47 0 2.8.5 3.84 1.49l2.88-2.88A9.96 9.96 0 0 0 12 2a10 10 0 0 0-8.93 5.52l3.34 2.59C7.2 7.74 9.4 5.98 12 5.98Z" />
            </svg>
          )}
          <span>{isSigningIn ? 'Signing in...' : 'Sign in with Google'}</span>
        </button>

        <button
          type="button"
          onClick={handleGuestContinue}
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface-base)]"
        >
          Continue as guest
        </button>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-4 inline-flex items-center justify-center text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
        >
          ← Back to role selection
        </button>
      </div>
    </section>
  )
}

export default LoginPage
