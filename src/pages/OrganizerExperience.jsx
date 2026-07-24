import { useState } from 'react'

const initialParticipants = [
  { id: 1, name: 'Maya', status: 'Pending', xp: 320, tokens: 260 },
  { id: 2, name: 'Jules', status: 'Approved', xp: 410, tokens: 320 },
  { id: 3, name: 'Noah', status: 'Pending', xp: 280, tokens: 240 },
]

function OrganizerExperience() {
  const [participants, setParticipants] = useState(initialParticipants)
  const [notice, setNotice] = useState('Approve participants to keep the event flow moving.')

  const handleApprove = (name) => {
    setParticipants((current) =>
      current.map((participant) =>
        participant.name === name ? { ...participant, status: 'Approved' } : participant,
      ),
    )
    setNotice(`Approval sent to ${name}`)
  }

  const approvedCount = participants.filter((participant) => participant.status === 'Approved').length

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_25px_70px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">Organizer studio</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Approve participation and monitor momentum</h1>
            <p className="mt-2 text-slate-600">Keep the live experience transparent with human review and instant stats.</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-fuchsia-500 px-4 py-3 text-white shadow-lg">
            <p className="text-sm uppercase tracking-[0.25em] text-blue-100">Live status</p>
            <p className="mt-1 text-sm font-semibold">{notice}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Participants" value={participants.length} />
        <StatCard label="Approved" value={approvedCount} />
        <StatCard label="Active Booths" value="12" />
      </section>

      <section className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.3)]">
        <h2 className="text-xl font-semibold text-slate-900">Approval queue</h2>
        <div className="mt-4 space-y-3">
          {participants.map((participant) => (
            <div key={participant.id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{participant.name}</p>
                <p className="text-sm text-slate-500">XP {participant.xp} • Tokens {participant.tokens}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  {participant.status}
                </span>
                <button
                  type="button"
                  onClick={() => handleApprove(participant.name)}
                  className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                >
                  Approve {participant.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-slate-950 p-4 text-white shadow-lg">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  )
}

export default OrganizerExperience
