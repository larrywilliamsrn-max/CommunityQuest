import { useMemo, useState } from 'react'
import { participantProfile, questCards as initialQuestCards, leaderboard as initialLeaderboard } from '../data/mockData'
import { mockCompleteQuest } from '../services/mockBlockchain'

function ParticipantDashboard() {
  const [profile, setProfile] = useState(participantProfile)
  const [quests, setQuests] = useState(initialQuestCards)
  const [leaderboard] = useState(initialLeaderboard)

  const progressPercent = Math.round((profile.xp / profile.nextLevelXp) * 100)

  const nextQuest = useMemo(() => {
    const pendingQuest = quests.find((quest) => quest.status === 'In Progress') ?? quests.find((quest) => quest.status === 'Queued')
    return pendingQuest?.title ?? 'Explore more quests'
  }, [quests])

  const handleScanQuest = () => {
    const updated = mockCompleteQuest(3, profile)
    setProfile(updated)
    setQuests((current) =>
      current.map((quest) =>
        quest.id === 3
          ? { ...quest, status: 'Completed', detail: 'Quest completed — you unlocked the next clue.', reward: '+30 XP +20 Tokens' }
          : quest,
      ),
    )
  }

  return (
    <div className="space-y-4">
      <section className="surface-card rounded-xl p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-[var(--text-secondary)]">Participant profile</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{profile.name}</h1>
            <p className="mt-2 text-[var(--text-secondary)]">Current level: <span className="font-semibold text-[var(--text-primary)]">{profile.level}</span></p>
          </div>
          <div className="rounded-xl bg-[var(--surface-inverted)] px-5 py-4 text-[var(--text-primary)]">
            <p className="text-sm uppercase tracking-[0.25em] text-[var(--text-secondary)]">Recommended</p>
            <p className="mt-2 text-xl font-semibold">{nextQuest}</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Reward: +30 XP</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <div className="grid gap-3 md:grid-cols-3">
            <StatCard label="XP" value={profile.xp} />
            <StatCard label="Tokens" value={profile.tokens} />
            <StatCard label="Leaderboard" value={`#${profile.position}`} />
          </div>

          <div className="surface-card rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">Quest Progress</h2>
                <p className="text-sm text-[var(--text-secondary)]">{profile.questsCompleted}/{profile.totalQuests} completed</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-[var(--text-primary)]">{progressPercent}%</p>
                <p className="text-sm text-[var(--text-secondary)]">to next level</p>
              </div>
            </div>
            <div className="mt-4 h-3 rounded-full bg-[var(--border-default)]">
              <div className="h-3 rounded-full bg-[var(--semantic-info)]" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="surface-card rounded-xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Active Quests</h2>
              <button
                type="button"
                onClick={handleScanQuest}
                className="rounded-full bg-[var(--surface-inverted)] px-4 py-2 text-sm font-semibold text-white"
              >
                Scan AI Booth QR
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
              {profile.badges.map((badge) => (
                <span key={badge} className="rounded-full border border-fuchsia-200 bg-fuchsia-50 px-3 py-2 text-sm font-medium text-fuchsia-700">
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-5">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Leaderboard</h2>
            {profile.latestReward ? (
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
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  )
}

export default ParticipantDashboard
