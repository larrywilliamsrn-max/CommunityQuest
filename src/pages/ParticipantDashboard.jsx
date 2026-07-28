import { useContext, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '../AuthContext'
import { getProfile, getQuests, getLeaderboard, completeQuest } from '../services/api'
import { participantProfile, questCards as mockQuests, leaderboard as mockLeaderboard } from '../data/mockData'

function ParticipantDashboard() {
  const { token } = useContext(AuthContext)

  const [profile,     setProfile]     = useState(null)
  const [quests,      setQuests]      = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [notice,      setNotice]      = useState(null)
  const [scanBusy,    setScanBusy]    = useState(false)

  const isLive = Boolean(token)

  useEffect(() => {
    if (!isLive) {
      // Demo mode — use mock data
      setProfile(participantProfile)
      setQuests(mockQuests)
      setLeaderboard(mockLeaderboard)
      setLoading(false)
      return
    }

    setLoading(true)
    Promise.all([getProfile(), getQuests(), getLeaderboard(10)])
      .then(([prof, qsts, board]) => {
        // Normalise profile shape from API
        setProfile({
          name:           prof.name,
          level:          prof.level || 1,
          xp:             prof.xp   || 0,
          nextLevelXp:    prof.level ? prof.level * 500 : 500,
          tokens:         prof.tokens || 0,
          questsCompleted: 0,      // filled below
          totalQuests:    qsts.length,
          position:       board.findIndex(e => e.uid === prof.id) + 1 || '—',
          badges:         prof.badges || [],
          latestReward:   null,
          _uid:           prof.id,
        })

        // Map API quest shape to the UI shape
        setQuests(qsts.map(q => ({
          id:     q.id,
          title:  q.title,
          detail: q.description || '',
          status: q.active ? 'In Progress' : 'Queued',
          reward: `+${q.xpReward || 0} XP  +${q.tokenReward || 0} Tokens`,
        })))

        setLeaderboard(board.map(e => ({
          name:      e.displayName,
          xp:        e.xp,
          tokens:    e.tokens,
          completed: e.badges,   // badge count as proxy
        })))
      })
      .catch(err => console.error('ParticipantDashboard fetch error:', err))
      .finally(() => setLoading(false))
  }, [isLive, token])

  const progressPercent = profile
    ? Math.min(100, Math.round(((profile.xp % 500) / 500) * 100))
    : 0

  const nextQuest = useMemo(() => {
    const pending = quests.find(q => q.status === 'In Progress') ?? quests.find(q => q.status === 'Queued')
    return pending?.title ?? 'Explore more quests'
  }, [quests])

  const handleScanQuest = async () => {
    // Pick the first In-Progress quest to complete
    const target = quests.find(q => q.status === 'In Progress')
    if (!target) return

    if (!isLive) {
      // Demo mode — local state update only
      setQuests(curr =>
        curr.map(q => q.id === target.id
          ? { ...q, status: 'Completed', detail: 'Quest completed — you unlocked the next clue.', reward: '+30 XP +20 Tokens' }
          : q
        )
      )
      setProfile(prev => ({
        ...prev,
        xp:          (prev?.xp || 0) + 30,
        tokens:      (prev?.tokens || 0) + 20,
        latestReward: { xp: 30, tokens: 20 },
      }))
      setNotice('Quest complete — earned 30 XP and 20 tokens! (demo)')
      return
    }

    setScanBusy(true)
    try {
      const result = await completeQuest(target.id)
      setNotice(`Quest complete — earned ${result.xp} XP and ${result.tokens} tokens!`)
      setQuests(curr =>
        curr.map(q => q.id === target.id
          ? { ...q, status: 'Completed', detail: 'Quest completed — you unlocked the next clue.', reward: `+${result.xp} XP  +${result.tokens} Tokens` }
          : q
        )
      )
      setProfile(prev => ({
        ...prev,
        xp:          result.newTotal.xp,
        tokens:      result.newTotal.tokens,
        badges:      [...(prev.badges || []), ...(result.badges || [])],
        latestReward: { xp: result.xp, tokens: result.tokens },
      }))
    } catch (err) {
      setNotice(`Error: ${err.message}`)
    } finally {
      setScanBusy(false)
    }
  }

  if (loading) {
    return <LoadingState />
  }

  return (
    <div className="space-y-4">
      {!isLive && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Demo mode — displaying mock data. Enter a wallet on the home screen to connect live data.
        </div>
      )}

      <section className="surface-card rounded-xl p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-[var(--text-secondary)]">Participant profile</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{profile?.name}</h1>
            <p className="mt-2 text-[var(--text-secondary)]">Level: <span className="font-semibold text-[var(--text-primary)]">{profile?.level}</span></p>
          </div>
          <div className="rounded-xl bg-[var(--surface-inverted)] px-5 py-4 text-[var(--text-primary)]">
            <p className="text-sm uppercase tracking-[0.25em] text-[var(--text-secondary)]">Recommended</p>
            <p className="mt-2 text-xl font-semibold">{nextQuest}</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Reward: +30 XP</p>
          </div>
        </div>
      </section>

      {notice && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <div className="grid gap-3 md:grid-cols-3">
            <StatCard label="XP"          value={profile?.xp} />
            <StatCard label="Tokens"      value={profile?.tokens} />
            <StatCard label="Leaderboard" value={typeof profile?.position === 'number' ? `#${profile.position}` : profile?.position} />
          </div>

          <div className="surface-card rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">Quest Progress</h2>
                <p className="text-sm text-[var(--text-secondary)]">{quests.filter(q => q.status === 'Completed').length}/{quests.length} completed</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-[var(--text-primary)]">{progressPercent}%</p>
                <p className="text-sm text-[var(--text-secondary)]">to next level</p>
              </div>
            </div>
            <div className="mt-4 h-3 rounded-full bg-[var(--border-default)]">
              <div className="h-3 rounded-full bg-[var(--semantic-info)] transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="surface-card rounded-xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Active Quests</h2>
              <button
                id="scan-quest-btn"
                type="button"
                onClick={handleScanQuest}
                disabled={scanBusy}
                className="rounded-full bg-[var(--surface-inverted)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {scanBusy ? 'Completing…' : 'Scan AI Booth QR'}
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {quests.map((quest) => (
                <div key={quest.id} className="flex items-center justify-between rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] px-4 py-3">
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{quest.title}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{quest.detail}</p>
                  </div>
                  <div className="text-right">
                    <p className="rounded-full bg-[var(--surface-base)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">{quest.status}</p>
                    <p className="mt-2 text-sm font-medium text-[var(--semantic-info)]">{quest.reward}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-5">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Badges</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {(profile?.badges || []).map((badge) => (
                <span key={badge} className="rounded-full border border-fuchsia-200 bg-fuchsia-50 px-3 py-2 text-sm font-medium text-fuchsia-700">
                  {badge}
                </span>
              ))}
              {(profile?.badges || []).length === 0 && (
                <p className="text-sm text-[var(--text-secondary)]">No badges yet — complete quests to earn them.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-5">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Leaderboard</h2>
            {profile?.latestReward ? (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                Quest completed — you earned {profile.latestReward.xp} XP and {profile.latestReward.tokens} tokens.
              </div>
            ) : null}
            <div className="mt-4 space-y-3">
              {leaderboard.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between rounded-xl bg-[var(--surface-base)] px-3 py-3">
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{index + 1}. {entry.name}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{entry.completed} quests</p>
                  </div>
                  <div className="text-right text-sm text-[var(--text-secondary)]">
                    <p>{entry.xp} XP</p>
                    <p>{entry.tokens} tokens</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
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

function LoadingState() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-[var(--text-secondary)]">
      <p className="animate-pulse text-sm">Loading your dashboard…</p>
    </div>
  )
}

export default ParticipantDashboard
