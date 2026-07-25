import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../AuthContext'

const roles = [
  {
    title: 'Participant',
    description: 'Track quests, earn XP, and unlock badges in real time.',
    role: 'participant',
  },
  {
    title: 'Organizer',
    description: 'Create quests, manage booths, and monitor participation live.',
    role: 'organizer',
  },
]

function LandingPage() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleEnter = (selectedRole) => {
    login(selectedRole)
    navigate('/login', { state: { selectedRole } })
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <div className="surface-card rounded-xl p-5 backdrop-blur">
        <p className="mb-3 inline-flex rounded-full bg-[rgba(34,197,94,0.12)] px-3 py-1 text-sm font-medium text-[var(--semantic-success)]">
          Hackathon MVP • QuestChain
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-5xl">
          Turn every event moment into a quest worth completing.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-[var(--text-secondary)]">
          Guide participants from “Where am I going?” to “What should I do next?” with XP, badges, and token rewards built for community events.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          {roles.map((role) => (
            <button
              key={role.title}
              type="button"
              onClick={() => handleEnter(role.role)}
              className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-inverted)] px-4 py-2 text-sm font-semibold text-white"
            >
              Enter as {role.title}
            </button>
          ))}
        </div>
      </div>

      <div className="surface-card rounded-xl border-[var(--border-default)] p-5">
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-secondary)]">Today&apos;s focus</p>
        <h2 className="mt-3 text-2xl font-semibold">Quest-driven participation</h2>
        <ul className="mt-6 space-y-4 text-sm text-blue-50">
          <li>• Register, attend, scan, and complete quests</li>
          <li>• Earn XP, tokens, and NFT-style badges</li>
          <li>• Receive a next-best-action recommendation</li>
        </ul>
      </div>
    </section>
  )
}

export default LandingPage
