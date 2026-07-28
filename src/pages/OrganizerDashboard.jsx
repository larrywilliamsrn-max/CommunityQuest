import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../AuthContext'
import { getStats, getQuests, createQuest } from '../services/api'

const FALLBACK_STATS = {
  participantsCount: 184,
  activeBooths:      12,
  mostPopularBooth:  'AI Lab',
  avgXP:             318,
}

function OrganizerDashboard() {
  const { token } = useContext(AuthContext)

  const [stats,       setStats]       = useState(null)
  const [quests,      setQuests]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [notice,      setNotice]      = useState(null)
  const [showForm,    setShowForm]    = useState(false)
  const [formBusy,    setFormBusy]    = useState(false)
  const [form,        setForm]        = useState({ title: '', description: '', tokenReward: '', xpReward: '' })

  const isLive = Boolean(token)

  useEffect(() => {
    if (!isLive) {
      setStats(FALLBACK_STATS)
      setQuests([
        { id: '1', title: 'Registration',       active: true,  xpReward: 25,  tokenReward: 20 },
        { id: '2', title: 'Keynote Attendance', active: true,  xpReward: 40,  tokenReward: 25 },
        { id: '3', title: 'Treasure Hunt',      active: false, xpReward: 30,  tokenReward: 20 },
      ])
      setLoading(false)
      return
    }

    setLoading(true)
    Promise.all([getStats(), getQuests()])
      .then(([s, q]) => {
        setStats(s)
        setQuests(q)
      })
      .catch(err => console.error('OrganizerDashboard fetch error:', err))
      .finally(() => setLoading(false))
  }, [isLive, token])

  const statCards = stats
    ? [
        { label: 'Participants',        value: stats.participantsCount ?? stats.participantsCount },
        { label: 'Active Booths',       value: stats.activeBooths },
        { label: 'Most Popular Booth',  value: stats.mostPopularBooth || 'AI Lab' },
        { label: 'Average XP',          value: stats.avgXP },
      ]
    : []

  const handleCreateQuest = async (e) => {
    e.preventDefault()
    if (!isLive) {
      setNotice('Connect a wallet on the home screen to create live quests.')
      setShowForm(false)
      return
    }
    setFormBusy(true)
    try {
      const created = await createQuest({
        title:       form.title,
        description: form.description,
        tokenReward: Number(form.tokenReward),
        xpReward:    Number(form.xpReward),
      })
      setQuests(q => [{ ...created }, ...q])
      setNotice(`Quest "${created.title}" created successfully.`)
      setShowForm(false)
      setForm({ title: '', description: '', tokenReward: '', xpReward: '' })
    } catch (err) {
      setNotice(`Error: ${err.message}`)
    } finally {
      setFormBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[var(--text-secondary)]">
        <p className="animate-pulse text-sm">Loading organizer dashboard…</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!isLive && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Demo mode — displaying mock data. Enter a wallet on the home screen for live stats.
        </div>
      )}

      {notice && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      <section className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-5 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-[var(--text-secondary)]">Organizer control center</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Live event operations</h1>
            <p className="mt-2 text-[var(--text-secondary)]">Create quests, approve participation, and keep momentum high with a live pulse on the crowd.</p>
          </div>
          <button
            id="create-quest-btn"
            type="button"
            onClick={() => setShowForm(f => !f)}
            className="rounded-xl bg-[var(--surface-inverted)] px-4 py-2 font-semibold text-white"
          >
            {showForm ? 'Cancel' : 'Create New Quest'}
          </button>
        </div>
      </section>

      {/* Inline create-quest form */}
      {showForm && (
        <section className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-5">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">New quest</h2>
          <form onSubmit={handleCreateQuest} className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              required
              placeholder="Title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="col-span-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--semantic-info)]"
            />
            <input
              placeholder="Description"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="col-span-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--semantic-info)]"
            />
            <input
              required type="number" min="0" placeholder="Token Reward"
              value={form.tokenReward}
              onChange={e => setForm(f => ({ ...f, tokenReward: e.target.value }))}
              className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--semantic-info)]"
            />
            <input
              type="number" min="0" placeholder="XP Reward"
              value={form.xpReward}
              onChange={e => setForm(f => ({ ...f, xpReward: e.target.value }))}
              className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--semantic-info)]"
            />
            <button
              type="submit"
              disabled={formBusy}
              className="col-span-2 rounded-xl bg-[var(--surface-inverted)] py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {formBusy ? 'Creating…' : 'Create Quest'}
            </button>
          </form>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-inverted)] p-4 text-white">
            <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold">{stat.value ?? '—'}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-5">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Quest overview</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {quests.map((q) => (
            <div key={q.id} className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-base)] p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-[var(--text-primary)]">{q.title}</p>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${q.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {q.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {q.description && <p className="mt-1 text-sm text-[var(--text-secondary)]">{q.description}</p>}
              <p className="mt-2 text-xs text-[var(--text-secondary)]">+{q.xpReward || 0} XP · +{q.tokenReward || 0} Tokens</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default OrganizerDashboard
