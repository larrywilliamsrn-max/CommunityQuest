import { useState } from 'react'

const initialBooths = [
  {
    id: 1,
    name: 'AI Booth',
    description: 'Meet the builders behind the latest event experiences.',
    status: 'Pending',
    clue: 'The next clue is hidden where Cloud meets AI.',
  },
  {
    id: 2,
    name: 'Community Lounge',
    description: 'Swap stories, spark ideas, and ask the experts.',
    status: 'Unlocked',
    clue: 'The next clue is near the place where ideas become products.',
  },
  {
    id: 3,
    name: 'Rewards Hub',
    description: 'Redeem your tokens once your trail is complete.',
    status: 'Locked',
    clue: 'The final answer is hidden where rewards are won.',
  },
]

function EventMapPage() {
  const [booths, setBooths] = useState(initialBooths)
  const [activeClue, setActiveClue] = useState('Complete a booth to unlock the next clue.')

  const handleCompleteBooth = (id) => {
    setBooths((current) =>
      current.map((booth) =>
        booth.id === id ? { ...booth, status: 'Completed' } : booth,
      ),
    )
    setActiveClue('The next clue is hidden where Cloud meets AI.')
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_25px_70px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">Event map</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Treasure hunt trail</h1>
            <p className="mt-2 text-slate-600">Each booth opens a clue, and each clue brings you closer to the final reward.</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-fuchsia-500 px-4 py-3 text-white shadow-lg">
            <p className="text-sm uppercase tracking-[0.25em] text-blue-100">Current clue</p>
            <p className="mt-1 text-sm font-semibold">{activeClue}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {booths.map((booth) => (
          <article key={booth.id} className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.3)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{booth.name}</h2>
                <p className="mt-2 text-sm text-slate-500">{booth.description}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                {booth.status}
              </span>
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
              {booth.clue}
            </div>
            <button
              type="button"
              onClick={() => handleCompleteBooth(booth.id)}
              className="mt-4 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
            >
              {booth.status === 'Completed' ? 'Completed' : `Complete ${booth.name}`}
            </button>
          </article>
        ))}
      </section>
    </div>
  )
}

export default EventMapPage
