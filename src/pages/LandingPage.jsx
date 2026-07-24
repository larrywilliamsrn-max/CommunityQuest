import { Link } from 'react-router-dom'

const roles = [
  {
    title: 'Participant',
    description: 'Track quests, earn XP, and unlock badges in real time.',
    href: '/participant',
  },
  {
    title: 'Organizer',
    description: 'Create quests, manage booths, and monitor participation live.',
    href: '/organizer',
  },
]

function LandingPage() {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <div className="rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)] backdrop-blur">
        <p className="mb-3 inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
          Hackathon MVP • QuestChain
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Turn every event moment into a quest worth completing.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-600">
          Guide participants from “Where am I going?” to “What should I do next?” with XP, badges, and token rewards built for community events.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {roles.map((role) => (
            <Link
              key={role.title}
              to={role.href}
              className="rounded-2xl border border-slate-200 bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              Enter as {role.title}
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-[32px] border border-fuchsia-100 bg-gradient-to-br from-blue-600 to-fuchsia-500 p-8 text-white shadow-[0_30px_80px_-30px_rgba(168,85,247,0.55)]">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-100">Today&apos;s focus</p>
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
