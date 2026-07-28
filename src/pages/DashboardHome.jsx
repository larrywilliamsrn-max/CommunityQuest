import { useContext, useEffect, useState } from 'react'
import { ArrowRight } from 'phosphor-react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../AuthContext'
import OnboardingIllustration from '../components/OnboardingIllustration'

const options = [
  { title: 'Participant', role: 'participant', description: 'Track quests, earn XP, and unlock badges.' },
  { title: 'Organizer',   role: 'organizer',  description: 'Create quests, manage booths, and monitor participation.' },
]

function DashboardHome() {
  const { login } = useContext(AuthContext)
  const navigate  = useNavigate()

  // Demo wallet input state
  const [wallet, setWallet]   = useState('')
  const [pending, setPending] = useState(null)  // role being logged in
  const [error, setError]     = useState(null)

  const handleEnter = async (selectedRole, path) => {
    setError(null)

    if (wallet.trim().startsWith('0x')) {
      // Real wallet → backend login
      setPending(selectedRole)
      try {
        await login(selectedRole, wallet.trim())
        navigate(path)
      } catch (err) {
        setError(err.message)
      } finally {
        setPending(null)
      }
    } else {
      // No wallet — role-only demo mode
      login(selectedRole)
      navigate(path)
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-2 lg:items-center">
      <div className="space-y-6">
        <div className="surface-card rounded-xl p-6">
          <p className="mb-2 inline-flex rounded-full bg-[rgba(34,197,94,0.12)] px-2 py-1 text-xs font-medium text-[var(--semantic-success)]">QuestChain workspace</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight text-[var(--text-primary)]">Turn attendance into engagement — run better events</h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-2xl">QuestChain helps events increase participation with lightweight, rewarding quests. Track attendance, reward attendees, and manage live experiences from a single dashboard.</p>

          {/* Optional wallet field */}
          <div className="mt-5">
            <label htmlFor="wallet-input" className="block text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              Wallet address (optional — for live data)
            </label>
            <input
              id="wallet-input"
              type="text"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="0x..."
              className="mt-2 w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--semantic-info)]"
            />
            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {options.map((item) => (
              <button
                key={item.role}
                id={`enter-${item.role}`}
                type="button"
                disabled={pending === item.role}
                onClick={() => handleEnter(item.role, `/${item.role}`)}
                className="inline-flex items-center gap-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-inverted)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {pending === item.role ? 'Connecting…' : `Enter as ${item.title}`}
                <ArrowRight size={16} weight="bold" />
              </button>
            ))}
            <a href="#learn" className="ml-2 text-sm font-medium text-[var(--text-primary)] underline">Learn more</a>
          </div>
        </div>

        <div id="learn" className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Why event teams choose QuestChain</h3>
          <ul className="mt-4 grid gap-3 text-sm text-[var(--text-secondary)]">
            <li>• Increase booth traffic with QR-driven quests</li>
            <li>• Reward participation with tokens and badges</li>
            <li>• Simple organizer controls for live approvals</li>
          </ul>
        </div>

        <div className="mt-6 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Frequently asked questions</h3>
          <div className="mt-4 space-y-4 text-sm text-[var(--text-secondary)]">
            <div>
              <p className="font-semibold text-[var(--text-primary)]">How do quests work?</p>
              <p className="mt-1">Quests are typically triggered by scanning a QR at a booth. Completing a quest awards XP and tokens instantly.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">Can I manage participants live?</p>
              <p className="mt-1">Yes — organizers can approve participants, view live stats, and push new quests during the event.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">Is user data stored on-chain?</p>
              <p className="mt-1">No — this MVP demonstrates on-chain-style rewards but stores event state off-chain for privacy and speed.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="w-full max-w-md surface-card rounded-xl bg-[var(--surface-card)] p-6">
          <OnboardingIllustration />
          <p className="mt-4 text-sm text-[var(--text-secondary)]">A modern, privacy-first onboarding. Enter a wallet address above for live data, or skip to browse the demo.</p>
        </div>
      </div>
    </section>
  )
}

export default DashboardHome
