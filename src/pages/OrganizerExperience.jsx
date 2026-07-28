import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../AuthContext'
import { getParticipants, approveParticipant, getStats } from '../services/api'

const MOCK_PARTICIPANTS = [
  { id: '1', name: 'Maya',  status: 'Pending',  xp: 320, tokens: 260, displayName: 'Maya' },
  { id: '2', name: 'Jules', status: 'Approved', xp: 410, tokens: 320, displayName: 'Jules' },
  { id: '3', name: 'Noah',  status: 'Pending',  xp: 280, tokens: 240, displayName: 'Noah' },
]

function OrganizerExperience() {
  const { token } = useContext(AuthContext)

  const [participants, setParticipants] = useState([])
  const [stats,        setStats]        = useState(null)
  const [notice,       setNotice]       = useState('Approve participants to keep the event flow moving.')
  const [loading,      setLoading]      = useState(true)
  const [approvingId,  setApprovingId]  = useState(null)

  const isLive = Boolean(token)

  useEffect(() => {
    if (!isLive) {
      setParticipants(MOCK_PARTICIPANTS)
      setStats({ participantsCount: 3, activeBooths: 12 })
      setLoading(false)
      return
    }

    setLoading(true)
    Promise.all([getParticipants(), getStats()])
      .then(([parts, s]) => {
        // Normalise API shape
        setParticipants(parts.map(p => ({
          id:     p.id,
          name:   p.displayName || p.name || p.uid,
          status: p.status === 'approved' ? 'Approved' : 'Pending',
          xp:     p.xp     || 0,
          tokens: p.tokens || 0,
        })))
        setStats(s)
      })
      .catch(err => {
        console.error('OrganizerExperience fetch error:', err)
        setNotice(`Error loading participants: ${err.message}`)
        setParticipants(MOCK_PARTICIPANTS)
      })
      .finally(() => setLoading(false))
  }, [isLive, token])

  const handleApprove = async (participant) => {
    if (!isLive) {
      setParticipants(curr =>
        curr.map(p => p.id === participant.id ? { ...p, status: 'Approved' } : p)
      )
      setNotice(`Approval sent to ${participant.name}`)
      return
    }

    setApprovingId(participant.id)
    try {
      await approveParticipant(participant.id)
      setParticipants(curr =>
        curr.map(p => p.id === participant.id ? { ...p, status: 'Approved' } : p)
      )
      setNotice(`${participant.name} approved successfully.`)
    } catch (err) {
      setNotice(`Error approving ${participant.name}: ${err.message}`)
    } finally {
      setApprovingId(null)
    }
  }

  const approvedCount = participants.filter(p => p.status === 'Approved').length

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[var(--text-secondary)]">
        <p className="animate-pulse text-sm">Loading organizer studio…</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!isLive && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Demo mode — connect a wallet on the home screen to manage live participants.
        </div>
      )}

      <section className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-5 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-[var(--text-secondary)]">Organizer studio</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Approve participation and monitor momentum</h1>
            <p className="mt-2 text-[var(--text-secondary)]">Keep the live experience transparent with human review and instant stats.</p>
          </div>
          <div className="rounded-xl bg-[var(--surface-card)] border border-[var(--border-default)] px-4 py-3 text-[var(--text-primary)]">
            <p className="text-sm uppercase tracking-[0.25em] text-[var(--text-secondary)]">Live status</p>
            <p className="mt-1 text-sm font-semibold">{notice}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Participants"  value={stats?.participantsCount ?? participants.length} />
        <StatCard label="Approved"      value={approvedCount} />
        <StatCard label="Active Booths" value={stats?.activeBooths ?? '—'} />
      </section>

      <section className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-5">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Approval queue</h2>
        <div className="mt-4 space-y-3">
          {participants.length === 0 && (
            <p className="text-sm text-[var(--text-secondary)]">No participants found.</p>
          )}
          {participants.map((participant) => (
            <div key={participant.id} className="flex flex-col gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-[var(--text-primary)]">{participant.name}</p>
                <p className="text-sm text-[var(--text-secondary)]">XP {participant.xp} · Tokens {participant.tokens}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                  participant.status === 'Approved'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {participant.status}
                </span>
                {participant.status !== 'Approved' && (
                  <button
                    id={`approve-btn-${participant.id}`}
                    type="button"
                    disabled={approvingId === participant.id}
                    onClick={() => handleApprove(participant)}
                    className="rounded-xl bg-[var(--surface-inverted)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {approvingId === participant.id ? 'Approving…' : `Approve ${participant.name}`}
                  </button>
                )}
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
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-inverted)] p-4 text-white">
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value ?? '—'}</p>
    </div>
  )
}

export default OrganizerExperience
